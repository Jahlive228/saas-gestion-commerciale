"use server";

import { prisma } from '@/lib/prisma';
import { TenantIsolation } from '@/server/middleware/tenant-isolation';
import type { AuthUser } from '@/server/auth/prisma-auth';
import { ScaleUnit } from '@prisma/client';

export interface CreateProductRequest {
  name: string;
  sku?: string;
  description?: string;
  price: number;
  cost_price?: number;
  stock_qty?: number;
  min_stock?: number;
  unit?: ScaleUnit;
  category_id?: string;
  tenant_id: string;
}

export interface UpdateProductRequest {
  name?: string;
  sku?: string;
  description?: string;
  price?: number;
  cost_price?: number;
  stock_qty?: number;
  min_stock?: number;
  unit?: ScaleUnit;
  category_id?: string;
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  category_id?: string;
  low_stock?: boolean;
  tenant_id?: string;
}

/**
 * Service de gestion des produits
 */
export class ProductsService {
  /**
   * Récupère la liste des produits avec pagination et filtres
   */
  static async getProducts(
    user: AuthUser,
    filters: ProductFilters = {}
  ) {
    const validTenantId = TenantIsolation.getValidTenantId(user, filters.tenant_id);
    const tenantFilter = TenantIsolation.getTenantFilter(user);

    if (validTenantId) {
      tenantFilter.tenant_id = validTenantId;
    }

    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {
      ...tenantFilter,
    };

    // Filtre de recherche
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { sku: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    // Filtre par catégorie
    if (filters.category_id) {
      where.category_id = filters.category_id;
    }

    // Filtre stock faible
    if (filters.low_stock) {
      where.stock_qty = {
        lte: prisma.product.fields.min_stock,
      };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          tenant: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Récupère les détails d'un produit
   */
  static async getProductById(user: AuthUser, productId: string) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
        tenant: {
          select: {
            id: true,
            name: true,
          },
        },
        transactions: {
          take: 10,
          orderBy: { created_at: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                first_name: true,
                last_name: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      return null;
    }

    // Vérifier l'accès au tenant
    if (!TenantIsolation.canAccessTenant(user, product.tenant_id)) {
      return null;
    }

    return product;
  }

  /**
   * Crée un nouveau produit
   */
  static async createProduct(
    user: AuthUser,
    data: CreateProductRequest
  ): Promise<{ success: true; product: any } | { success: false; error: string }> {
    // Vérifier l'accès au tenant
    const accessCheck = await TenantIsolation.validateTenantAccess(user, data.tenant_id);
    if (!accessCheck.valid) {
      return { success: false, error: accessCheck.error };
    }

    try {
      // Vérifier l'unicité du SKU si fourni
      if (data.sku) {
        const existing = await prisma.product.findUnique({
          where: {
            tenant_id_sku: {
              tenant_id: data.tenant_id,
              sku: data.sku,
            },
          },
        });

        if (existing) {
          return { success: false, error: 'Un produit avec ce SKU existe déjà' };
        }
      }

      const product = await prisma.product.create({
        data: {
          name: data.name,
          sku: data.sku,
          description: data.description,
          price: data.price,
          cost_price: data.cost_price,
          stock_qty: data.stock_qty || 0,
          min_stock: data.min_stock || 5,
          unit: data.unit || ScaleUnit.PIECE,
          category_id: data.category_id,
          tenant_id: data.tenant_id,
        },
        include: {
          category: true,
          tenant: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return { success: true, product };
    } catch (error: any) {
      console.error('Erreur lors de la création du produit:', error);
      return {
        success: false,
        error: error.message || 'Erreur lors de la création du produit',
      };
    }
  }

  /**
   * Met à jour un produit
   */
  static async updateProduct(
    user: AuthUser,
    productId: string,
    data: UpdateProductRequest
  ): Promise<{ success: true; product: any } | { success: false; error: string }> {
    // Vérifier que le produit existe et que l'utilisateur y a accès
    const product = await this.getProductById(user, productId);
    if (!product) {
      return { success: false, error: 'Produit introuvable ou accès non autorisé' };
    }

    try {
      // Vérifier l'unicité du SKU si modifié
      if (data.sku && data.sku !== product.sku) {
        const existing = await prisma.product.findUnique({
          where: {
            tenant_id_sku: {
              tenant_id: product.tenant_id,
              sku: data.sku,
            },
          },
        });

        if (existing) {
          return { success: false, error: 'Un produit avec ce SKU existe déjà' };
        }
      }

      const updatedProduct = await prisma.product.update({
        where: { id: productId },
        data: {
          ...(data.name && { name: data.name }),
          ...(data.sku !== undefined && { sku: data.sku }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.price !== undefined && { price: data.price }),
          ...(data.cost_price !== undefined && { cost_price: data.cost_price }),
          ...(data.stock_qty !== undefined && { stock_qty: data.stock_qty }),
          ...(data.min_stock !== undefined && { min_stock: data.min_stock }),
          ...(data.unit && { unit: data.unit }),
          ...(data.category_id !== undefined && { category_id: data.category_id }),
        },
        include: {
          category: true,
          tenant: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return { success: true, product: updatedProduct };
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du produit:', error);
      return {
        success: false,
        error: error.message || 'Erreur lors de la mise à jour du produit',
      };
    }
  }

  /**
   * Supprime un produit
   */
  static async deleteProduct(
    user: AuthUser,
    productId: string
  ): Promise<{ success: true } | { success: false; error: string }> {
    // Vérifier que le produit existe et que l'utilisateur y a accès
    const product = await this.getProductById(user, productId);
    if (!product) {
      return { success: false, error: 'Produit introuvable ou accès non autorisé' };
    }

    try {
      // Vérifier qu'il n'y a pas de ventes associées
      const salesCount = await prisma.saleItem.count({
        where: { product_id: productId },
      });

      if (salesCount > 0) {
        return {
          success: false,
          error: 'Impossible de supprimer un produit avec des ventes associées',
        };
      }

      await prisma.product.delete({
        where: { id: productId },
      });

      return { success: true };
    } catch (error: any) {
      console.error('Erreur lors de la suppression du produit:', error);
      return {
        success: false,
        error: error.message || 'Erreur lors de la suppression du produit',
      };
    }
  }

  /**
   * Récupère les produits en stock faible
   */
  static async getLowStockProducts(user: AuthUser) {
    const tenantFilter = TenantIsolation.getTenantFilter(user);

    const products = await prisma.product.findMany({
      where: {
        ...tenantFilter,
        stock_qty: {
          lte: prisma.product.fields.min_stock,
        },
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        { stock_qty: 'asc' },
        { name: 'asc' },
      ],
    });

    return products;
  }
}
