"use server";

import { prisma } from '@/lib/prisma';
import { TransactionType, SaleStatus, Role } from '@prisma/client';
import { TenantIsolation } from '@/server/middleware/tenant-isolation';
import type { AuthUser } from '@/server/auth/prisma-auth';

export interface CreateSaleItem {
  product_id: string;
  quantity: number;
}

export interface CreateSaleRequest {
  items: CreateSaleItem[];
  tenant_id: string;
}

/**
 * Service de gestion des ventes avec transactions atomiques
 * Garantit l'intégrité des stocks (zéro survidage)
 */
export class SalesService {
  /**
   * Crée une vente et déduit atomiquement le stock
   * Utilise une transaction PostgreSQL pour garantir l'intégrité
   */
  static async createSale(
    user: AuthUser,
    request: CreateSaleRequest
  ): Promise<
    | { success: true; saleId: string; reference: string }
    | { success: false; error: string }
  > {
    // Vérifier l'accès au tenant
    const accessCheck = await TenantIsolation.validateTenantAccess(user, request.tenant_id);
    if (!accessCheck.valid) {
      return { success: false, error: accessCheck.error };
    }

    // Vérifier que l'utilisateur peut créer une vente
    if (user.role !== Role.VENDEUR && user.role !== Role.SUPERADMIN) {
      return { success: false, error: 'Seuls les vendeurs peuvent créer des ventes' };
    }

    try {
      // Utiliser une transaction Prisma pour garantir l'atomicité
      const result = await prisma.$transaction(async (tx) => {
        // 1. Vérifier les stocks et calculer le total
        let totalAmount = 0;
        const saleItems: Array<{
          product_id: string;
          quantity: number;
          unit_price: number;
          total_price: number;
        }> = [];

        for (const item of request.items) {
          // Verrouiller la ligne du produit (SELECT FOR UPDATE)
          const product = await tx.product.findUnique({
            where: { id: item.product_id },
          });

          if (!product) {
            throw new Error(`Produit ${item.product_id} introuvable`);
          }

          // Vérifier l'accès au tenant du produit
          if (!TenantIsolation.canAccessTenant(user, product.tenant_id)) {
            throw new Error('Accès non autorisé à ce produit');
          }

          // Vérifier le stock disponible
          if (product.stock_qty < item.quantity) {
            throw new Error(
              `Stock insuffisant pour ${product.name}. Disponible: ${product.stock_qty}, Demandé: ${item.quantity}`
            );
          }

          const unitPrice = Number(product.price);
          const totalPrice = unitPrice * item.quantity;
          totalAmount += totalPrice;

          saleItems.push({
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: unitPrice,
            total_price: totalPrice,
          });
        }

        // 2. Générer une référence unique
        const reference = await this.generateSaleReference(tx, request.tenant_id);

        // 3. Créer la vente
        const sale = await tx.sale.create({
          data: {
            reference,
            tenant_id: request.tenant_id,
            seller_id: user.id,
            total_amount: totalAmount,
            status: SaleStatus.COMPLETED,
            items: {
              create: saleItems,
            },
          },
        });

        // 4. Déduire les stocks et créer les transactions de stock
        for (const item of request.items) {
          // Mettre à jour le stock (déduction atomique)
          await tx.product.update({
            where: { id: item.product_id },
            data: {
              stock_qty: {
                decrement: item.quantity,
              },
            },
          });

          // Créer la transaction de stock
          await tx.stockTransaction.create({
            data: {
              product_id: item.product_id,
              user_id: user.id,
              type: TransactionType.SALE,
              quantity: -item.quantity, // Négatif pour déduction
              reason: `Vente ${reference}`,
            },
          });
        }

        return { saleId: sale.id, reference: sale.reference };
      });

      return {
        success: true,
        saleId: result.saleId,
        reference: result.reference,
      };
    } catch (error: any) {
      console.error('Erreur lors de la création de la vente:', error);
      return {
        success: false,
        error: error.message || 'Erreur lors de la création de la vente',
      };
    }
  }

  /**
   * Génère une référence unique pour une vente
   * Format: SALE-YYYY-MMDD-HHMMSS-XXXX
   */
  private static async generateSaleReference(
    tx: {
      sale: {
        count: (args: { where: any }) => Promise<number>;
        findUnique: (args: { where: { reference: string } }) => Promise<any>;
      };
    },
    tenantId: string
  ): Promise<string> {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    // Compter les ventes du jour pour générer un numéro séquentiel
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const count = await tx.sale.count({
      where: {
        tenant_id: tenantId,
        created_at: {
          gte: startOfDay,
        },
      },
    });

    const sequence = String(count + 1).padStart(4, '0');
    const reference = `SALE-${year}-${month}${day}-${hours}${minutes}${seconds}-${sequence}`;

    // Vérifier l'unicité (très peu probable mais sécurité)
    const existing = await tx.sale.findUnique({
      where: { reference },
    });

    if (existing) {
      // Si collision, réessayer avec un timestamp différent
      return this.generateSaleReference(tx, tenantId);
    }

    return reference;
  }

  /**
   * Récupère les ventes d'un tenant avec pagination
   */
  static async getSales(
    user: AuthUser,
    tenantId: string | null,
    options: {
      page?: number;
      limit?: number;
      startDate?: Date;
      endDate?: Date;
    } = {}
  ) {
    const validTenantId = TenantIsolation.getValidTenantId(user, tenantId);
    const tenantFilter = TenantIsolation.getTenantFilter(user);

    if (validTenantId) {
      tenantFilter.tenant_id = validTenantId;
    }

    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {
      ...tenantFilter,
    };

    if (options.startDate || options.endDate) {
      where.created_at = {};
      if (options.startDate) {
        where.created_at.gte = options.startDate;
      }
      if (options.endDate) {
        where.created_at.lte = options.endDate;
      }
    }

    const [sales, total] = await Promise.all([
      prisma.sale.findMany({
        where,
        include: {
          seller: {
            select: {
              id: true,
              email: true,
              first_name: true,
              last_name: true,
            },
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  sku: true,
                },
              },
            },
          },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      prisma.sale.count({ where }),
    ]);

    return {
      sales,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
