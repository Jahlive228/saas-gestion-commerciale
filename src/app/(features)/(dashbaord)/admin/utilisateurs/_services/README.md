# Configuration des colonnes de tableau

Ce fichier démontre comment créer et utiliser des colonnes réutilisables pour les tableaux DataTable.

## Structure

### `columns.tsx`
```typescript
// Fonction qui retourne la configuration des colonnes
export function getAdminColumns({
  onEdit,
  onToggleStatus, 
  onDelete,
  isToggling,
  isDeleting,
}: AdminColumnsProps): Column<Admin>[] {
  return [
    // Configuration des colonnes...
  ];
}
```

### Utilisation dans le composant

```typescript
import { getAdminColumns } from '../_services/columns';

// Dans le composant
const columns = getAdminColumns({
  onEdit: handleEditAdmin,
  onToggleStatus: handleToggleStatus,
  onDelete: handleDeleteAdmin,
  isToggling: toggleStatusMutation.isPending,
  isDeleting: deleteAdminMutation.isPending,
});
```

## Avantages

✅ **Réutilisabilité** - Colonnes configurables et réutilisables  
✅ **Séparation des préoccupations** - Logique UI séparée du composant  
✅ **Maintenabilité** - Modifications centralisées  
✅ **Type Safety** - Types TypeScript stricts  
✅ **Testabilité** - Colonnes testables indépendamment  

## Types de colonnes supportées

- **Rendu simple** : Affichage direct de valeurs
- **Rendu personnalisé** : JSX complexe avec composants
- **Actions** : Boutons avec callbacks
- **Statuts** : Badges colorés
- **Dates** : Formatage automatique
- **Alignement** : left, center, right

## Bonnes pratiques

1. **Callbacks** : Passez les handlers comme props
2. **États de loading** : Gérez les états pending des mutations
3. **Accessibilité** : Ajoutez des `title` et `aria-label`
4. **Responsive** : Utilisez des classes adaptatives
5. **Performance** : Évitez les re-renders inutiles
