# Authentification Bearer Token

## 📋 Vue d'ensemble

Le système d'authentification utilise maintenant des **Bearer tokens** stockés dans la base de données. Chaque utilisateur possède un token unique qui peut être utilisé pour authentifier les requêtes API.

## 🔐 Endpoints d'authentification

### 1. POST /api/auth/login

**Description** : Connexion et récupération du token Bearer

**Requête** :
```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "admin@saas.com",
  "password": "password123"
}
```

**Réponse** :
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clx1234567890123456789012",
      "email": "admin@saas.com",
      "first_name": "Admin",
      "last_name": "User",
      "role": "SUPERADMIN",
      "tenant_id": null,
      "is_active": true
    },
    "token": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2"
  }
}
```

### 2. GET /api/auth/me

**Description** : Récupère les informations de l'utilisateur connecté avec son token

**Requête** :
```http
GET http://localhost:3000/api/auth/me
Authorization: Bearer <votre-token>
```

**Réponse** :
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clx1234567890123456789012",
      "email": "admin@saas.com",
      "first_name": "Admin",
      "last_name": "User",
      "role": "SUPERADMIN",
      "tenant_id": null,
      "is_active": true,
      "created_at": "2024-01-15T00:00:00.000Z",
      "updated_at": "2024-01-15T00:00:00.000Z",
      "last_login": "2024-01-15T12:00:00.000Z",
      "tenant": null
    },
    "token": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2",
    "token_expires_at": "2024-02-14T12:00:00.000Z"
  }
}
```

### 3. POST /api/auth/logout

**Description** : Révoque le token de l'utilisateur connecté

**Requête** :
```http
POST http://localhost:3000/api/auth/logout
Authorization: Bearer <votre-token>
```

**Réponse** :
```json
{
  "success": true,
  "message": "Déconnexion réussie"
}
```

## 🔑 Utilisation dans Insomnia

### Configuration

1. **Créer un environnement** avec les variables :
   ```
   base_url = http://localhost:3000
   token = (vide au départ)
   ```

2. **Se connecter** :
   - Faire une requête `POST /api/auth/login`
   - Copier le `token` de la réponse
   - L'ajouter dans la variable d'environnement `token`

3. **Configurer l'authentification** :
   - Dans chaque requête, ajouter le header :
     ```
     Authorization: Bearer {{ token }}
     ```

### Exemple de requête

```http
GET {{ base_url }}/api/products?page=1&limit=10
Authorization: Bearer {{ token }}
```

## 📝 Caractéristiques du Token

- **Longueur** : 64 caractères (32 bytes en hexadécimal)
- **Durée de validité** : 30 jours par défaut
- **Stockage** : Base de données PostgreSQL (table `User`)
- **Sécurité** : Token unique par utilisateur, révocable à tout moment

## 🔄 Migration depuis les Cookies

Les routes API supportent maintenant **à la fois** :
- **Bearer Token** (prioritaire) : Pour les clients API externes (Insomnia, Postman, etc.)
- **Cookies HTTP-only** : Pour l'interface web (compatibilité maintenue)

Le système détecte automatiquement le type d'authentification utilisé.

## ⚠️ Notes importantes

1. **Expiration** : Les tokens expirent après 30 jours. Il faut se reconnecter pour obtenir un nouveau token.

2. **Révocation** : Un token peut être révoqué via `/api/auth/logout` ou en désactivant le compte utilisateur.

3. **Sécurité** : Ne jamais partager votre token. Si compromis, utilisez `/api/auth/logout` pour le révoquer immédiatement.

4. **Un seul token actif** : Chaque nouvelle connexion génère un nouveau token et invalide l'ancien.

## 🧪 Tests

### Test de connexion
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@saas.com","password":"password123"}'
```

### Test avec token
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <votre-token>"
```

### Test de déconnexion
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer <votre-token>"
```
