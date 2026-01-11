import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/server/auth/require-auth';
import { requirePermission } from '@/server/permissions/require-permission';
import { PERMISSION_CODES } from '@/constants/permissions-saas';
import { prisma } from '@/lib/prisma';
import { TenantIsolation } from '@/server/middleware/tenant-isolation';
import { SaleStatus, TransactionType } from '@prisma/client';

/**
 * POST /api/sales/:id/cancel
 * Annuler une vente
 * Permission requise: sales.cancel
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    await requirePermission(PERMISSION_CODES.SALES_CANCEL);

    const { id } = await context.params;

    // Vérifier que la vente existe et que l'utilisateur y a accès
    const sale = await prisma.sale.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!sale) {
      return NextResponse.json(
        {
          success: false,
          error: 'Vente introuvable',
        },
        { status: 404 }
      );
    }

    if (!TenantIsolation.canAccessTenant(session.user, sale.tenant_id)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Accès non autorisé',
        },
        { status: 403 }
      );
    }

    if (sale.status === SaleStatus.CANCELLED) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cette vente est déjà annulée',
        },
        { status: 400 }
      );
    }

    // Annuler la vente et restaurer les stocks
    const result = await prisma.$transaction(async (tx) => {
      // Mettre à jour le statut de la vente
      const updatedSale = await tx.sale.update({
        where: { id },
        data: {
          status: SaleStatus.CANCELLED,
        },
      });

      // Restaurer les stocks pour chaque produit
      for (const item of sale.items) {
        await tx.product.update({
          where: { id: item.product_id },
          data: {
            stock_qty: {
              increment: item.quantity,
            },
          },
        });

        // Créer une transaction de stock pour l'annulation
        await tx.stockTransaction.create({
          data: {
            product_id: item.product_id,
            user_id: session.user.id,
            type: TransactionType.RETURN,
            quantity: item.quantity,
            reason: `Annulation de la vente ${sale.reference}`,
          },
        });
      }

      return updatedSale;
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Erreur POST /api/sales/:id/cancel:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erreur lors de l\'annulation de la vente',
      },
      { status: 500 }
    );
  }
}
