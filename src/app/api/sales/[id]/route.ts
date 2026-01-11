import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/server/auth/require-auth';
import { requirePermission } from '@/server/permissions/require-permission';
import { PERMISSION_CODES } from '@/constants/permissions-saas';
import { prisma } from '@/lib/prisma';
import { TenantIsolation } from '@/server/middleware/tenant-isolation';
import { SaleStatus } from '@prisma/client';

/**
 * GET /api/sales/:id
 * Détails d'une vente
 * Permission requise: sales.view
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    await requirePermission(PERMISSION_CODES.SALES_VIEW);

    const { id } = await context.params;
    const sale = await prisma.sale.findUnique({
      where: { id },
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
        tenant: {
          select: {
            id: true,
            name: true,
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

    // Vérifier l'accès au tenant
    if (!TenantIsolation.canAccessTenant(session.user, sale.tenant_id)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Accès non autorisé',
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: sale,
    });
  } catch (error: any) {
    console.error('Erreur GET /api/sales/:id:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erreur lors de la récupération de la vente',
      },
      { status: error.status || 500 }
    );
  }
}

/**
 * PUT /api/sales/:id
 * Mettre à jour une vente
 * Permission requise: sales.update
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    await requirePermission(PERMISSION_CODES.SALES_UPDATE);

    const { id } = await context.params;
    const body = await request.json();

    // Vérifier que la vente existe et que l'utilisateur y a accès
    const sale = await prisma.sale.findUnique({
      where: { id },
      select: { tenant_id: true, status: true },
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

    // Mettre à jour la vente
    const updatedSale = await prisma.sale.update({
      where: { id },
      data: {
        ...(body.status && { status: body.status as SaleStatus }),
      },
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
    });

    return NextResponse.json({
      success: true,
      data: updatedSale,
    });
  } catch (error: any) {
    console.error('Erreur PUT /api/sales/:id:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erreur lors de la mise à jour de la vente',
      },
      { status: 500 }
    );
  }
}
