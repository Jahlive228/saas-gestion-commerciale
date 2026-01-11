/**
 * Script pour mettre à jour toutes les routes API pour utiliser Bearer token
 * Usage: node scripts/update-api-routes.js
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const API_ROUTES_DIR = path.join(__dirname, '../src/app/api');

// Patterns de remplacement
const replacements = [
  {
    // Imports
    from: /import { requireAuth } from '@/server\/auth\/require-auth';/g,
    to: "import { requireAuthAPI } from '@/server/auth/require-auth-api';"
  },
  {
    from: /import { requirePermission } from '@/server\/permissions\/require-permission';/g,
    to: "import { requirePermissionAPI } from '@/server/permissions/require-permission-api';"
  },
  {
    from: /import { sessionToAuthUser } from '@/server\/auth\/session-to-auth-user';/g,
    to: ""
  },
  {
    // Utilisation
    from: /const session = await requireAuth\(\);/g,
    to: "const authUser = await requireAuthAPI(request);"
  },
  {
    from: /await requirePermission\(([^)]+)\);/g,
    to: "await requirePermissionAPI(authUser, $1);"
  },
  {
    from: /const authUser = sessionToAuthUser\(session\);/g,
    to: ""
  },
  {
    // Fonction sessionToAuthUser locale
    from: /function sessionToAuthUser\([^)]+\): AuthUser \{[\s\S]*?\}\n\n/g,
    to: ""
  }
];

function updateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  replacements.forEach(({ from, to }) => {
    if (from.test(content)) {
      content = content.replace(from, to);
      modified = true;
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Updated: ${filePath}`);
    return true;
  }

  return false;
}

// Trouver tous les fichiers route.ts
const files = glob.sync('**/route.ts', {
  cwd: API_ROUTES_DIR,
  absolute: true
});

console.log(`Found ${files.length} route files\n`);

let updatedCount = 0;
files.forEach(file => {
  if (updateFile(file)) {
    updatedCount++;
  }
});

console.log(`\n✓ Updated ${updatedCount} files`);
