# Guide Rapide - Test des API avec Insomnia

## 🚀 Démarrage Rapide

### 1. Récupérer le Cookie de Session

1. Ouvrir l'application dans le navigateur : `http://localhost:3000`
2. Se connecter avec :
   - Email : `admin@saas.com`
   - Mot de passe : `password123`
3. Ouvrir les DevTools (F12)
4. Aller dans l'onglet **Application** > **Cookies** > `http://localhost:3000`
5. Copier la valeur du cookie `saas-session`

### 2. Configurer Insomnia

1. Créer un nouvel environnement dans Insomnia
2. Ajouter les variables :
   ```
   base_url = http://localhost:3000
   cookie = <collez la valeur du cookie ici>
   ```

### 3. Tester les Routes

Utilisez les exemples ci-dessous ou importez le fichier `insomnia-examples.json`.

---

## 📋 Requêtes Essentielles à Tester

### ✅ Test 1 : Vérifier les permissions
```
GET http://localhost:3000/api/permissions/me
Cookie: saas-session=<votre-cookie>
```

### ✅ Test 2 : Lister les produits
```
GET http://localhost:3000/api/products?page=1&limit=10
Cookie: saas-session=<votre-cookie>
```

### ✅ Test 3 : Créer un produit
```
POST http://localhost:3000/api/products
Cookie: saas-session=<votre-cookie>
Content-Type: application/json

{
  "name": "Test Produit",
  "sku": "TEST-001",
  "price": 99.99,
  "stock_qty": 10,
  "min_stock": 5,
  "unit": "PIECE",
  "tenant_id": "clx2345678901234567890123"
}
```

### ✅ Test 4 : Créer une vente (POS)
```
POST http://localhost:3000/api/sales
Cookie: saas-session=<votre-cookie>
Content-Type: application/json

{
  "items": [
    {
      "product_id": "clx2345678901234567890123",
      "quantity": 1
    }
  ],
  "tenant_id": "clx2345678901234567890123"
}
```

### ✅ Test 5 : Réapprovisionner le stock
```
POST http://localhost:3000/api/stock/restock
Cookie: saas-session=<votre-cookie>
Content-Type: application/json

{
  "product_id": "clx2345678901234567890123",
  "quantity": 20,
  "reason": "Test réapprovisionnement"
}
```

---

## 🔍 Vérification des Réponses

### Réponse Succès
```json
{
  "success": true,
  "data": { ... }
}
```

### Réponse Erreur
```json
{
  "success": false,
  "error": "Message d'erreur"
}
```

---

## ⚠️ Erreurs Courantes

### 401 Unauthorized
- **Cause** : Cookie de session invalide ou expiré
- **Solution** : Se reconnecter et récupérer un nouveau cookie

### 403 Forbidden
- **Cause** : Permission insuffisante
- **Solution** : Vérifier que l'utilisateur a les bonnes permissions

### 404 Not Found
- **Cause** : ID de ressource invalide
- **Solution** : Utiliser les IDs réels de votre base de données

---

## 📝 IDs de Test (Base de données seedée)

Après avoir exécuté le seed SQL, vous pouvez utiliser ces IDs :

- **Superadmin** : `clx1234567890123456789012`
- **Tenant Shop A** : `clx2345678901234567890123`
- **Tenant Shop B** : `clx3456789012345678901234`
- **Category Électronique** : `clx9012345678901234567890`
- **Product Laptop HP** : `clx2345678901234567890123`

---

Pour plus de détails, consultez `docs/API_TESTING_INSOMNIA.md`
