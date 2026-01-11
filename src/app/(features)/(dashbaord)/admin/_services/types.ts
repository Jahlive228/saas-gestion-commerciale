export interface TenantStats {
  totalUsers: number;
  activeUsers: number;
  totalProducts: number;
  lowStockProducts: number;
  totalSales: number;
  currentMonthSales: number;
  totalRevenue: number;
  currentMonthRevenue: number;
  revenueGrowth: number;
  salesGrowth: number;
  tenantName: string;
}

export interface ChartDataPoint {
  date: string;
  revenue: number;
  sales: number;
}
