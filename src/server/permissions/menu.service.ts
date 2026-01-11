import { requireAuth } from '@/server/auth/require-auth';
import { PermissionService } from './permission.service';
import { ROUTE_PERMISSIONS } from '@/constants/permissions-saas';
import type { PermissionCode } from '@/constants/permissions-saas';
import { Role } from '@prisma/client';

export interface MenuItem {
  name: string;
  path: string;
  icon?: string;
  children?: MenuItem[];
  permission?: PermissionCode | PermissionCode[];
}

/**
 * Service pour générer le menu dynamique basé sur les permissions de l'utilisateur
 */
export class MenuService {
  /**
   * Récupère le menu personnalisé pour l'utilisateur connecté
   */
  static async getUserMenu(): Promise<MenuItem[]> {
    const session = await requireAuth();
    const role = session.jwtPayload.role_name as Role;
    
    // Récupérer toutes les permissions du rôle
    const userPermissions = await PermissionService.getRolePermissions(role);
    
    // Menu de base pour tous les utilisateurs
    const baseMenu: MenuItem[] = [
      {
        name: 'Dashboard',
        path: '/home',
        icon: 'DashboardIcon',
      },
    ];

    // Menu selon le rôle et les permissions
    const roleMenu: MenuItem[] = [];

    // SUPERADMIN - Accès complet à toutes les fonctionnalités
    if (role === 'SUPERADMIN') {
      // Dashboard Superadmin
      roleMenu.push({
        name: 'Dashboard Superadmin',
        path: '/superadmin',
        icon: 'CrownIcon',
        permission: 'stats.view_global' as PermissionCode,
      });
      
      // Gestion des Commerces (Tenants)
      roleMenu.push({
        name: 'Commerces',
        path: '/superadmin/tenants',
        icon: 'BuildingIcon',
        permission: 'tenants.view' as PermissionCode,
      });
      
      // Statistiques Globales
      roleMenu.push({
        name: 'Statistiques Globales',
        path: '/superadmin/stats',
        icon: 'ChartIcon',
        permission: 'stats.view_global' as PermissionCode,
      });

      // Le SUPERADMIN a aussi accès aux fonctionnalités des commerces
      // Produits (tous commerces)
      if (userPermissions.includes('products.view')) {
        roleMenu.push({
          name: 'Produits',
          path: '/admin/products',
          icon: 'PackageIcon',
          permission: 'products.view' as PermissionCode,
        });
      }

      // Catégories
      if (userPermissions.includes('categories.view')) {
        roleMenu.push({
          name: 'Catégories',
          path: '/admin/categories',
          icon: 'TagIcon',
          permission: 'categories.view' as PermissionCode,
        });
      }

      // Stocks
      if (userPermissions.includes('stock.view')) {
        roleMenu.push({
          name: 'Stocks',
          path: '/admin/stock',
          icon: 'WarehouseIcon',
          permission: 'stock.view' as PermissionCode,
        });
      }

      // Ventes
      if (userPermissions.includes('sales.view')) {
        roleMenu.push({
          name: 'Ventes',
          path: '/admin/sales',
          icon: 'ReceiptIcon',
          permission: 'sales.view' as PermissionCode,
        });
      }
    }

    // DIRECTEUR
    if (role === 'DIRECTEUR') {
      roleMenu.push(
        {
          name: 'Équipe',
          path: '/admin/team',
          icon: 'GroupIcon',
          permission: 'users.view' as PermissionCode,
        },
        {
          name: 'Produits',
          path: '/admin/products',
          icon: 'PackageIcon',
          permission: 'products.view' as PermissionCode,
        },
        {
          name: 'Stocks',
          path: '/admin/stock',
          icon: 'WarehouseIcon',
          permission: 'stock.view' as PermissionCode,
        },
        {
          name: 'Ventes',
          path: '/admin/sales',
          icon: 'ShoppingCartIcon',
          permission: 'sales.view' as PermissionCode,
        },
        {
          name: 'Statistiques',
          path: '/admin/stats',
          icon: 'ChartIcon',
          permission: 'stats.view_tenant' as PermissionCode,
        }
      );
    }

    // GERANT
    if (role === 'GERANT') {
      roleMenu.push(
        {
          name: 'Point de Vente',
          path: '/pos',
          icon: 'ShoppingCartIcon',
          permission: 'sales.create' as PermissionCode,
        },
        {
          name: 'Mes Ventes',
          path: '/pos/sales',
          icon: 'ReceiptIcon',
          permission: ['sales.view_own', 'sales.view'] as PermissionCode[],
        }
      );
    }

    // VENDEUR
    if (role === 'VENDEUR') {
      roleMenu.push(
        {
          name: 'Point de Vente',
          path: '/pos',
          icon: 'ShoppingCartIcon',
          permission: 'sales.create' as PermissionCode,
        },
        {
          name: 'Mes Ventes',
          path: '/pos/sales',
          icon: 'ReceiptIcon',
          permission: 'sales.view_own' as PermissionCode,
        }
      );
    }

    // MAGASINIER
    if (role === 'MAGASINIER') {
      roleMenu.push(
        {
          name: 'Entrepôt',
          path: '/warehouse',
          icon: 'WarehouseIcon',
          permission: 'stock.view' as PermissionCode,
        },
        {
          name: 'Catalogue',
          path: '/catalog',
          icon: 'PackageIcon',
          permission: 'products.view' as PermissionCode,
        }
      );
    }

    // Menu Administration (pour SUPERADMIN et DIRECTEUR)
    if (['SUPERADMIN', 'DIRECTEUR'].includes(role)) {
      const adminMenu: MenuItem[] = [];
      
      if (userPermissions.includes('users.view')) {
        adminMenu.push({
          name: 'Utilisateurs',
          path: '/admin/utilisateurs',
          icon: 'UserIcon',
        });
      }
      
      if (userPermissions.includes('roles.view')) {
        adminMenu.push({
          name: 'Rôles',
          path: '/admin/roles',
          icon: 'ShieldIcon',
        });
      }

      if (userPermissions.includes('permissions.view')) {
        adminMenu.push({
          name: 'Permissions',
          path: '/admin/permissions',
          icon: 'LockIcon',
        });
      }

      if (adminMenu.length > 0) {
        roleMenu.push({
          name: 'Administration',
          path: '/admin',
          icon: 'SettingsIcon',
          children: adminMenu,
        });
      }
    }

    // Filtrer le menu selon les permissions
    const filteredMenu = roleMenu.filter(item => {
      if (!item.permission) return true;
      
      if (Array.isArray(item.permission)) {
        return item.permission.some(perm => userPermissions.includes(perm));
      }
      
      return userPermissions.includes(item.permission);
    });

    // Menu Profile (toujours disponible)
    const profileMenu: MenuItem = {
      name: 'Profile',
      path: '/profile',
      icon: 'UserIcon',
    };

    return [...baseMenu, ...filteredMenu, profileMenu];
  }

  /**
   * Vérifie si l'utilisateur peut accéder à une route
   */
  static async canAccessRoute(route: string): Promise<boolean> {
    try {
      const session = await requireAuth();
      const role = session.jwtPayload.role_name as Role;
      const userPermissions = await PermissionService.getRolePermissions(role);
      
      const requiredPermissions = ROUTE_PERMISSIONS[route];
      
      if (!requiredPermissions || requiredPermissions.length === 0) {
        return true; // Route publique
      }

      return requiredPermissions.some(perm => userPermissions.includes(perm));
    } catch {
      return false;
    }
  }
}
