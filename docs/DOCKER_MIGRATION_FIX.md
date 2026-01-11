# Correction des Migrations Docker

## 🔍 Problème identifié

La migration `20250115120000_add_api_token` était marquée comme appliquée dans `_prisma_migrations` mais les colonnes `api_token` et `token_expires_at` n'existaient pas réellement dans la table `User` de Docker.

## ✅ Solution appliquée

### 1. Migration SQL corrigée

La migration SQL a été corrigée pour utiliser des blocs `DO $$` PostgreSQL qui vérifient l'existence des colonnes avant de les ajouter :

```sql
-- Vérifier et ajouter les colonnes si elles n'existent pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'User' 
        AND column_name = 'api_token'
    ) THEN
        ALTER TABLE "User" ADD COLUMN "api_token" TEXT;
    END IF;
    -- ... même chose pour token_expires_at
END $$;
```

### 2. Script d'application manuelle

Un script SQL a été créé (`scripts/apply-api-token-migration.sql`) pour forcer l'application de la migration dans Docker :

```bash
# Appliquer la migration manuellement
Get-Content scripts/apply-api-token-migration.sql | docker exec -i saas_postgres psql -U postgres -d saas_db
```

### 3. Dockerfile amélioré

Le Dockerfile a été amélioré pour :
- Copier `prisma.config.ts` dans l'image Docker
- Améliorer le script d'entrypoint pour mieux gérer les migrations
- Attendre que la base de données soit prête avant d'appliquer les migrations

## 🚀 Application de la migration

### Option 1 : Via le script SQL (recommandé pour correction immédiate)

```powershell
# Supprimer l'enregistrement de migration incorrect
docker exec saas_postgres psql -U postgres -d saas_db -c "DELETE FROM _prisma_migrations WHERE migration_name = '20250115120000_add_api_token';"

# Appliquer la migration
Get-Content scripts/apply-api-token-migration.sql | docker exec -i saas_postgres psql -U postgres -d saas_db
```

### Option 2 : Via Prisma migrate deploy

```bash
# Dans le conteneur Docker
docker exec saas_app node node_modules/.bin/prisma migrate deploy
```

### Option 3 : Rebuild Docker (pour nouvelles déploiements)

```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## ✅ Vérification

Vérifier que les colonnes existent :

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'User' 
AND column_name IN ('api_token', 'token_expires_at');
```

Ou via Docker :

```bash
docker exec saas_postgres psql -U postgres -d saas_db -c "SELECT column_name FROM information_schema.columns WHERE table_name = 'User' AND column_name IN ('api_token', 'token_expires_at');"
```

## 📝 Notes importantes

1. **Migration idempotente** : La migration est maintenant idempotente et peut être exécutée plusieurs fois sans erreur.

2. **Prisma migrate deploy** : Utilise `prisma migrate deploy` en production, pas `prisma migrate dev`.

3. **Vérification** : Toujours vérifier que les colonnes existent après l'application d'une migration.

4. **Docker** : Les migrations sont appliquées automatiquement au démarrage du conteneur via le script d'entrypoint.

## 🔧 Troubleshooting

### Si les colonnes n'existent toujours pas :

1. Vérifier que la migration a été exécutée :
   ```sql
   SELECT * FROM _prisma_migrations WHERE migration_name = '20250115120000_add_api_token';
   ```

2. Supprimer l'enregistrement et réappliquer :
   ```sql
   DELETE FROM _prisma_migrations WHERE migration_name = '20250115120000_add_api_token';
   ```

3. Réappliquer la migration manuellement avec le script SQL.

4. Si nécessaire, reconstruire l'image Docker.
