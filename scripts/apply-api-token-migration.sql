-- Script SQL pour appliquer la migration api_token dans Docker
-- Usage: docker exec -i saas_postgres psql -U postgres -d saas_db < scripts/apply-api-token-migration.sql

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
DO $$
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
            RAISE NOTICE 'Colonne api_token ajoutée';
        END IF;
        
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'User' 
            AND column_name = 'token_expires_at'
        ) THEN
            ALTER TABLE "User" ADD COLUMN "token_expires_at" TIMESTAMP(3);
            RAISE NOTICE 'Colonne token_expires_at ajoutée';
        END IF;
        
        -- Créer les index si ils n'existent pas
        IF NOT EXISTS (
            SELECT 1 FROM pg_indexes 
            WHERE schemaname = 'public' 
            AND tablename = 'User' 
            AND indexname = 'User_api_token_key'
        ) THEN
            CREATE UNIQUE INDEX "User_api_token_key" ON "User"("api_token");
            RAISE NOTICE 'Index unique User_api_token_key créé';
        END IF;
        
        IF NOT EXISTS (
            SELECT 1 FROM pg_indexes 
            WHERE schemaname = 'public' 
            AND tablename = 'User' 
            AND indexname = 'User_api_token_idx'
        ) THEN
            CREATE INDEX "User_api_token_idx" ON "User"("api_token");
            RAISE NOTICE 'Index User_api_token_idx créé';
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
END $$;

-- Vérifier que les colonnes existent
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'User' 
AND column_name IN ('api_token', 'token_expires_at');
