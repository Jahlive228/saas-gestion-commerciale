import { TenantStatus } from '@prisma/client';

export interface TenantWithStats {
  id: string;
  name: string;
  slug: string;
  email: string | null;
  phone: string | null;
  status: TenantStatus;
  created_at: Date;
  updated_at: Date;
  _count: {
    users: number;
    products: number;
    sales: number;
  };
}

export interface GlobalStats {
  totalTenants: number;
  activeTenants: number;
  suspendedTenants: number;
  totalUsers: number;
  totalProducts: number;
  totalSales: number;
  totalRevenue: number;
  revenueGrowth: number;
  salesGrowth: number;
}

export interface TenantRevenueData {
  tenantId: string;
  tenantName: string;
  revenue: number;
  salesCount: number;
  activeUsers: number;
  productsCount: number;
}

export interface ChartDataPoint {
  date: string;
  revenue: number;
  sales: number;
}

export interface CreateTenantFormData {
  name: string;
  slug: string;
  email?: string;
  phone?: string;
}

export interface UpdateTenantFormData {
  name?: string;
  slug?: string;
  email?: string;
  phone?: string;
  status?: TenantStatus;
}
