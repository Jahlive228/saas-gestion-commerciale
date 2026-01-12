#!/bin/sh
set -e

echo "=== Docker Entrypoint - Initialisation de l'application ==="

# Attendre que la base de données soit prête
echo "⏳ Attente de la connexion à la base de données..."
for i in 1 2 3 4 5 6 7 8 9 10; do
  if node -e "
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    prisma.\$queryRaw\`SELECT 1\`
      .then(() => { console.log('OK'); process.exit(0); })
      .catch(() => { process.exit(1); });
  " > /dev/null 2>&1; then
    echo "✓ Base de données prête!"
    break
  fi
  echo "  Tentative $i/10..."
  sleep 2
done

# Exécuter les migrations
echo ""
echo "🔄 Exécution des migrations Prisma..."
node node_modules/.bin/prisma migrate deploy
echo "✓ Migrations terminées"

# Vérifier si la base de données est vide (pas de superadmin)
echo ""
echo "🔍 Vérification de l'état de la base de données..."
SUPERADMIN_COUNT=$(node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.user.count({ where: { role: 'SUPERADMIN' } })
  .then(count => { console.log(count); prisma.\$disconnect(); process.exit(0); })
  .catch(() => { console.log('0'); process.exit(0); });
" 2>/dev/null || echo "0")

if [ "$SUPERADMIN_COUNT" = "0" ]; then
  echo "📦 Base de données vide, exécution du seed..."
  
  # Exécuter le seed des permissions
  echo "  → Seed des permissions..."
  node_modules/.bin/tsx prisma/seed-permissions.ts
  
  # Exécuter le seed principal
  echo "  → Seed principal..."
  node_modules/.bin/tsx prisma/seed.ts
  
  echo "✓ Seed terminé"
else
  echo "✓ Base de données déjà initialisée (Superadmin trouvé)"
fi

echo ""
echo "🚀 Démarrage de l'application..."
exec node server.js
