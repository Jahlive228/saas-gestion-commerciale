# Script PowerShell pour appliquer les migrations dans Docker

Write-Host "=== Application des migrations Prisma dans Docker ===" -ForegroundColor Cyan

# Vérifier que le conteneur Docker existe
$containerExists = docker ps | Select-String -Pattern "saas_postgres"
if (-not $containerExists) {
    Write-Host "❌ Erreur: Le conteneur saas_postgres n'est pas en cours d'exécution" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Conteneur Docker trouvé" -ForegroundColor Green

# Créer le script SQL temporaire
$sqlScript = @"
-- Vérifier et créer la table _prisma_migrations si elle n'existe pas
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
    "id" VARCHAR(36) NOT NULL,
    "checksum" VARCHAR(64) NOT NULL,
    "finished_at" TIMESTAMP(3),
    "migration_name" VARCHAR(255) NOT NULL,
    "logs" TEXT,
    "rolled_back_at" TIMESTAMP(3),
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "applied_steps_count" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "_prisma_migrations_pkey" PRIMARY KEY ("id")
);

-- Vérifier si la migration a déjà été appliquée
DO `$\$`
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM "_prisma_migrations" 
        WHERE migration_name = '20250115120000_add_api_token'
    ) THEN
        -- Ajouter les colonnes si elles n'existent pas
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'User' 
            AND column_name = 'api_token'
        ) THEN
            ALTER TABLE "User" ADD COLUMN "api_token" TEXT;
        END IF;
        
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'User' 
            AND column_name = 'token_expires_at'
        ) THEN
            ALTER TABLE "User" ADD COLUMN "token_expires_at" TIMESTAMP(3);
        END IF;
        
        -- Créer les index si ils n'existent pas
        IF NOT EXISTS (
            SELECT 1 FROM pg_indexes 
            WHERE schemaname = 'public' 
            AND tablename = 'User' 
            AND indexname = 'User_api_token_key'
        ) THEN
            CREATE UNIQUE INDEX "User_api_token_key" ON "User"("api_token");
        END IF;
        
        IF NOT EXISTS (
            SELECT 1 FROM pg_indexes 
            WHERE schemaname = 'public' 
            AND tablename = 'User' 
            AND indexname = 'User_api_token_idx'
        ) THEN
            CREATE INDEX "User_api_token_idx" ON "User"("api_token");
        END IF;
        
        -- Enregistrer la migration comme appliquée
        INSERT INTO "_prisma_migrations" (
            id, 
            checksum, 
            finished_at, 
            migration_name, 
            started_at, 
            applied_steps_count
        ) VALUES (
            gen_random_uuid()::text,
            '',
            NOW(),
            '20250115120000_add_api_token',
            NOW(),
            1
        );
        
        RAISE NOTICE 'Migration 20250115120000_add_api_token appliquée avec succès';
    ELSE
        RAISE NOTICE 'Migration 20250115120000_add_api_token déjà appliquée';
    END IF;
END `$\$`;
"@

# Écrire le script SQL dans un fichier temporaire
$tempFile = [System.IO.Path]::GetTempFileName() + ".sql"
$sqlScript | Out-File -FilePath $tempFile -Encoding UTF8

try {
    Write-Host "Application de la migration..." -ForegroundColor Yellow
    
    # Copier le fichier SQL dans le conteneur et l'exécuter
    docker cp $tempFile saas_postgres:/tmp/migration.sql
    docker exec saas_postgres psql -U postgres -d saas_db -f /tmp/migration.sql
    
    Write-Host "✓ Migration appliquée avec succès" -ForegroundColor Green
    
    # Vérifier que les colonnes existent
    Write-Host "Vérification des colonnes..." -ForegroundColor Yellow
    docker exec saas_postgres psql -U postgres -d saas_db -c "SELECT column_name FROM information_schema.columns WHERE table_name = 'User' AND column_name IN ('api_token', 'token_expires_at');"
    
    Write-Host "=== Migration terminée ===" -ForegroundColor Cyan
} finally {
    # Nettoyer le fichier temporaire
    Remove-Item -Path $tempFile -Force -ErrorAction SilentlyContinue
    docker exec saas_postgres rm -f /tmp/migration.sql
}
