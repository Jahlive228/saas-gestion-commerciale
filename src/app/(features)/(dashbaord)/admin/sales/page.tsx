"use client";

import React, { useEffect, useState } from "react";
import DataTable from "@/components/common/DataTable";
import Button from "@/components/ui/button/Button";
import {
  EyeIcon,
  DocumentTextIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { getSalesAction, type Sale } from "./_services/actions";
import { SaleStatus } from "@prisma/client";

const statusLabels: Record<SaleStatus, string> = {
  PENDING: "En attente",
  COMPLETED: "Complétée",
  CANCELLED: "Annulée",
  REFUNDED: "Remboursée",
};

const statusColors: Record<SaleStatus, string> = {
  PENDING: "bg-warning-100 text-warning-700",
  COMPLETED: "bg-success-100 text-success-700",
  CANCELLED: "bg-gray-100 text-gray-600",
  REFUNDED: "bg-blue-light-100 text-blue-light-700",
};

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<SaleStatus | "ALL">("ALL");

  const loadSales = async () => {
    setIsLoading(true);
    setError(null);
    const result = await getSalesAction();
    if (result.success && result.data) {
      setSales(result.data);
    } else {
      setError(result.error || "Erreur lors du chargement");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadSales();
  }, []);

  const filteredSales =
    statusFilter === "ALL"
      ? sales
      : sales.filter((sale) => sale.status === statusFilter);

  const totalRevenue = sales
    .filter((s) => s.status === "COMPLETED")
    .reduce((sum, s) => sum + s.total_amount, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: Date | string) => {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const columns = [
    {
      key: "reference",
      title: "Référence",
      render: (_: unknown, record: Record<string, unknown>) => {
        const sale = record as unknown as Sale;
        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center">
              <DocumentTextIcon className="w-5 h-5 text-brand-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900 font-mono">
                {sale.reference}
              </p>
              <p className="text-xs text-gray-500">
                {sale.items_count} article{sale.items_count > 1 ? "s" : ""}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      key: "total_amount",
      title: "Montant",
      align: "right" as const,
      render: (_: unknown, record: Record<string, unknown>) => {
        const sale = record as unknown as Sale;
        return (
          <div className="text-right">
            <p className="font-semibold text-gray-900">
              {formatCurrency(sale.total_amount)}
            </p>
          </div>
        );
      },
    },
    {
      key: "status",
      title: "Statut",
      align: "center" as const,
      render: (_: unknown, record: Record<string, unknown>) => {
        const sale = record as unknown as Sale;
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[sale.status]}`}
          >
            {statusLabels[sale.status]}
          </span>
        );
      },
    },
    {
      key: "seller",
      title: "Vendeur",
      render: (_: unknown, record: Record<string, unknown>) => {
        const sale = record as unknown as Sale;
        const fullName =
          `${sale.seller?.first_name || ""} ${sale.seller?.last_name || ""}`.trim() ||
          "Inconnu";
        return <span className="text-sm text-gray-600">{fullName}</span>;
      },
    },
    {
      key: "tenant",
      title: "Commerce",
      render: (_: unknown, record: Record<string, unknown>) => {
        const sale = record as unknown as Sale;
        return (
          <span className="text-sm text-gray-600">{sale.tenant?.name}</span>
        );
      },
    },
    {
      key: "created_at",
      title: "Date",
      render: (_: unknown, record: Record<string, unknown>) => {
        const sale = record as unknown as Sale;
        return (
          <span className="text-sm text-gray-500">
            {formatDate(sale.created_at)}
          </span>
        );
      },
    },
    {
      key: "actions",
      title: "Actions",
      align: "center" as const,
      render: () => {
        return (
          <div className="flex items-center justify-center gap-2">
            <Button variant="outline" size="sm">
              <EyeIcon className="w-4 h-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ventes</h1>
          <p className="text-gray-600 mt-1">
            Consultez et gérez toutes les ventes de la plateforme
          </p>
        </div>
        <Button variant="outline" onClick={loadSales} className="flex items-center gap-2">
          <ArrowPathIcon className="w-5 h-5" />
          Actualiser
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Ventes</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{sales.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Chiffre d&apos;Affaires</p>
          <p className="text-2xl font-bold text-brand-600 mt-1">
            {formatCurrency(totalRevenue)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Complétées</p>
          <p className="text-2xl font-bold text-success-600 mt-1">
            {sales.filter((s) => s.status === "COMPLETED").length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">En Attente</p>
          <p className="text-2xl font-bold text-warning-600 mt-1">
            {sales.filter((s) => s.status === "PENDING").length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {(["ALL", "COMPLETED", "PENDING", "CANCELLED", "REFUNDED"] as const).map(
          (status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === status
                  ? "bg-brand-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {status === "ALL" ? "Toutes" : statusLabels[status as SaleStatus]}
            </button>
          )
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6">
          {error ? (
            <div className="text-center py-8">
              <p className="text-error-600 mb-4">{error}</p>
              <Button variant="outline" onClick={loadSales}>
                Réessayer
              </Button>
            </div>
          ) : (
            <DataTable
              data={filteredSales}
              columns={columns}
              loading={isLoading}
              emptyMessage="Aucune vente trouvée"
            />
          )}
        </div>
      </div>
    </div>
  );
}
