# Architecture TanStack Query + Server Actions pour Next.js

Ce document décrit l'architecture recommandée pour l'intégration de TanStack Query avec les Server Actions dans notre application Next.js.

## 📋 Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Structure des fichiers](#structure-des-fichiers)
- [Patterns d'implémentation](#patterns-dimplémentation)
- [Exemples concrets](#exemples-concrets)
- [Bonnes pratiques](#bonnes-pratiques)
- [Migration d'une approche classique](#migration-dune-approche-classique)

## 🎯 Vue d'ensemble

Cette architecture combine les **Server Actions Next.js** avec **TanStack Query** pour créer une couche de données robuste, performante et type-safe.

### Avantages

✅ **Consistance** - Même pattern dans toute l'application  
✅ **Performance** - Cache intelligent et optimisations automatiques  
✅ **Type Safety** - Types partagés entre server et client  
✅ **DX** - Developer Experience améliorée  
✅ **Maintenance** - Code plus organisé et réutilisable  

## 📁 Structure des fichiers

Pour chaque feature/route, adoptez cette structure :

```
src/app/(features)/(route)/[feature]/
├── page.tsx                    # Page principale
├── _components/               # Composants spécifiques
│   ├── FeatureTable.tsx
│   ├── FeatureModal.tsx
│   └── FeatureForm.tsx
├── _services/                 # Couche de données
│   ├── actions.ts            # Server Actions
│   ├── queries.ts            # TanStack Query hooks
│   ├── types.ts              # Types TypeScript
│   └── schemas.ts            # Schemas de validation
└── _hooks/                   # Hooks métier (optionnel)
    └── useFeature.ts
```

## 🔧 Patterns d'implémentation

### 1. Types TypeScript (`types.ts`)

```typescript
// Réponses API
export interface ApiPagination {
  current_page: number;
  total_pages: number;
  total_count: number;
  page_size: number;
}

export interface GetAllItemsResponse {
  status: string;
  code: number;
  message: string;
  content: {
    items: Item[];
    pagination: ApiPagination;
  };
}

// Requêtes
export interface CreateItemRequest {
  name: string;
  description: string;
}

// Filtres
export interface ItemFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

// Résultats d'actions
export type ActionResult<T = void> = 
  | { success: true; data?: T }
  | { success: false; error: string };
```

### 2. Server Actions (`actions.ts`)

```typescript
"use server";

import { revalidatePath } from 'next/cache';
import { api } from '@/server/interceptor/axios.interceptor';
import type { 
  GetAllItemsResponse,
  CreateItemRequest,
  ItemFilters,
  ActionResult
} from './types';

/**
 * Récupère la liste des items avec pagination
 */
export async function getAllItemsAction(
  filters: ItemFilters = {}
): Promise<ActionResult<GetAllItemsResponse>> {
  try {
    const { page = 1, limit = 10, search } = filters;
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
    });

    const response = await api.get<GetAllItemsResponse>(`/items/?${params}`);
    return { success: true, data: response.data };
  } catch (error: unknown) {
    const axiosError = error as { response?: { data?: { detail?: string } } };
    const message = axiosError?.response?.data?.detail || 'Erreur lors de la récupération';
    return { success: false, error: message };
  }
}

/**
 * Crée un nouvel item
 */
export async function createItemAction(
  data: CreateItemRequest
): Promise<ActionResult<CreateItemResponse>> {
  try {
    const response = await api.post<CreateItemResponse>('/items/', data);
    
    // Revalidation pour les pages statiques
    revalidatePath('/dashboard/items');
    
    return { success: true, data: response.data };
  } catch (error: unknown) {
    const axiosError = error as { response?: { data?: { detail?: string } } };
    const message = axiosError?.response?.data?.detail || 'Erreur lors de la création';
    return { success: false, error: message };
  }
}
```

### 3. TanStack Query Hooks (`queries.ts`)

```typescript
"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { 
  getAllItemsAction,
  createItemAction,
  deleteItemAction
} from './actions';
import type { ItemFilters } from './types';

// Query Keys
export const itemQueryKeys = {
  all: ['items'] as const,
  lists: () => [...itemQueryKeys.all, 'list'] as const,
  list: (filters: ItemFilters) => [...itemQueryKeys.lists(), filters] as const,
  details: () => [...itemQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...itemQueryKeys.details(), id] as const,
};

/**
 * Hook pour récupérer la liste des items
 */
export function useItems(filters: ItemFilters = {}) {
  return useQuery({
    queryKey: itemQueryKeys.list(filters),
    queryFn: async () => {
      const result = await getAllItemsAction(filters);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook pour créer un item
 */
export function useCreateItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const result = await createItemAction(data);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      // Invalider le cache
      queryClient.invalidateQueries({ queryKey: itemQueryKeys.lists() });
      toast.success('Item créé avec succès');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Erreur lors de la création');
    },
  });
}
```

### 4. Composant React (`ItemsTable.tsx`)

```typescript
"use client";

import React, { useState } from 'react';
import { useItems, useDeleteItem } from '../_services/queries';
import DataTable from '@/components/common/DataTable';
import Button from '@/components/ui/button/Button';

export default function ItemsTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  // TanStack Query hooks
  const { 
    data: response, 
    isLoading, 
    error 
  } = useItems({
    page: currentPage,
    limit: 10,
    search: searchTerm || undefined,
  });

  const deleteItemMutation = useDeleteItem();

  // Extraction des données
  const items = response?.content?.items || [];
  const pagination = response?.content?.pagination;

  const handleDelete = async (itemId: string) => {
    try {
      await deleteItemMutation.mutateAsync(itemId);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const columns = [
    {
      key: 'name',
      title: 'Nom',
      render: (value: string) => value,
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_: unknown, item: Item) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleDelete(item.id)}
          loading={deleteItemMutation.isPending}
        >
          Supprimer
        </Button>
      ),
    },
  ];

  if (error) {
    return <div>Erreur lors du chargement</div>;
  }

  return (
    <DataTable
      data={items}
      columns={columns}
      loading={isLoading}
      emptyMessage="Aucun item trouvé"
    />
  );
}
```

## 🎯 Exemples concrets

### Exemple : Page de gestion d'utilisateurs

```typescript
// src/app/(features)/(dashboard)/admin/users/page.tsx
import UsersTable from './_components/UsersTable';
import UsersStats from './_components/UsersStats';

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <UsersStats />
      <UsersTable />
    </div>
  );
}
```

### Exemple : Composant avec formulaire

```typescript
// src/app/(features)/(dashboard)/admin/users/_components/UserModal.tsx
import { useCreateUser, useUpdateUser } from '../_services/queries';

export default function UserModal({ user, onClose }: UserModalProps) {
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  
  const isEditing = !!user;
  const mutation = isEditing ? updateUserMutation : createUserMutation;

  const handleSubmit = async (data: FormData) => {
    try {
      await mutation.mutateAsync(data);
      onClose();
    } catch (error) {
      // Erreur déjà gérée dans le hook
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Formulaire */}
      <Button 
        type="submit" 
        loading={mutation.isPending}
      >
        {isEditing ? 'Modifier' : 'Créer'}
      </Button>
    </form>
  );
}
```

## ✅ Bonnes pratiques

### 1. **Query Keys**
```typescript
// ✅ Bonnes pratiques
export const queryKeys = {
  all: ['feature'] as const,
  lists: () => [...queryKeys.all, 'list'] as const,
  list: (filters: Filters) => [...queryKeys.lists(), filters] as const,
  details: () => [...queryKeys.all, 'detail'] as const,
  detail: (id: string) => [...queryKeys.details(), id] as const,
};

// ❌ À éviter
const queryKey = 'users'; // Trop générique
const queryKey = ['users', page, search]; // Difficile à gérer
```

### 2. **Gestion d'erreurs**
```typescript
// ✅ Dans les Server Actions
export async function actionExample() {
  try {
    // Logic
    return { success: true, data };
  } catch (error) {
    return { success: false, error: 'Message d\'erreur' };
  }
}

// ✅ Dans les hooks TanStack Query
mutationFn: async (data) => {
  const result = await actionExample(data);
  if (!result.success) {
    throw new Error(result.error); // TanStack Query gère l'erreur
  }
  return result.data;
}
```

### 3. **Invalidation du cache**
```typescript
// ✅ Invalider spécifiquement
queryClient.invalidateQueries({ queryKey: itemQueryKeys.lists() });

// ✅ Invalider plusieurs caches liés
queryClient.invalidateQueries({ queryKey: itemQueryKeys.all });

// ❌ Invalider tout
queryClient.invalidateQueries(); // Trop large
```

### 4. **Types et interfaces**
```typescript
// ✅ Types réutilisables
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface User extends BaseEntity {
  name: string;
  email: string;
}

// ✅ Types de réponse standardisés
export interface ApiResponse<T> {
  status: string;
  code: number;
  message: string;
  content: T;
}
```

## 🔄 Migration d'une approche classique

### Avant (useEffect + useState)
```typescript
// ❌ Ancienne approche
const [users, setUsers] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const result = await getUsersAction();
      if (result.success) {
        setUsers(result.data.content.users);
      }
    } catch (error) {
      toast.error('Erreur');
    } finally {
      setLoading(false);
    }
  };
  
  fetchUsers();
}, []);
```

### Après (TanStack Query)
```typescript
// ✅ Nouvelle approche
const { data: response, isLoading } = useUsers();
const users = response?.content?.users || [];
```

## 📚 Ressources

- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [React Hook Form](https://react-hook-form.com/) pour les formulaires
- [Zod](https://zod.dev/) pour la validation des schémas

---

## 🚀 À retenir

1. **Séparez les responsabilités** : Server Actions pour la logique métier, TanStack Query pour la gestion du cache
2. **Utilisez des types stricts** : TypeScript pour la sécurité des types
3. **Optimisez le cache** : `staleTime` et `gcTime` appropriés
4. **Gérez les erreurs de manière cohérente** : Pattern `ActionResult` dans les Server Actions
5. **Invalidez intelligemment** : Utilisez des query keys hiérarchiques

Cette architecture vous permettra de créer des applications Next.js performantes, maintenables et scalables ! 🎉
