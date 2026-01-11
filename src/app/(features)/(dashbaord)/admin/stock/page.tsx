"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DataTable from "@/components/common/DataTable";
import Button from "@/components/ui/button/Button";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

interface StockItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  min_stock: number;
  category: {
    id: string;
    name: string;
  } | null;
  tenant: {
    id: string;
    name: string;
  };
  last_restock: string | null;
}

interface StockTransaction {
  id: string;
  type: "ENTRY" | "EXIT" | "ADJUSTMENT" | "SALE" | "RETURN";
  quantity: number;
  reason: string | null;
  product: {
    id: string;
    name: string;
  };
  user: {
    first_name: string | null;
    last_name: string | null;
  };
  created_at: string;
}

async function fetchStock(): Promise<StockItem[]> {
  const response = await fetch("/api/stock");
  if (!response.ok) {
    throw new Error("Erreur lors de la récupération du stock");
  }
  const data = await response.json();
  return data.data || [];
}

export default function StockPage() {
  const [activeTab, setActiveTab] = useState<"inventory" | "movements">(
    "inventory"
  );

  const {
    data: stockItems = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["stock"],
    queryFn: fetchStock,
  });

  const lowStockItems = stockItems.filter(
    (item) => item.quantity <= item.min_stock && item.quantity > 0
  );
  const outOfStockItems = stockItems.filter((item) => item.quantity === 0);
  const healthyStockItems = stockItems.filter(
    (item) => item.quantity > item.min_stock
  );

  const columns = [
    {
      key: "name",
      title: "Produit",
      render: (_: unknown, record: Record<string, unknown>) => {
        const item = record as unknown as StockItem;
        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center">
              <span className="text-brand-600 font-semibold text-sm">
                {item.name.substring(0, 2).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-medium text-gray-900">{item.name}</p>
              <p className="text-xs text-gray-500">SKU: {item.sku}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: "category",
      title: "Catégorie",
      render: (_: unknown, record: Record<string, unknown>) => {
        const item = record as unknown as StockItem;
        return (
          <span className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-700">
            {item.category?.name || "Non catégorisé"}
          </span>
        );
      },
    },
    {
      key: "quantity",
      title: "Quantité",
      align: "center" as const,
      render: (_: unknown, record: Record<string, unknown>) => {
        const item = record as unknown as StockItem;
        const isLowStock = item.quantity <= item.min_stock && item.quantity > 0;
        const isOutOfStock = item.quantity === 0;

        return (
          <div className="flex items-center justify-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                isOutOfStock
                  ? "bg-error-100 text-error-700"
                  : isLowStock
                    ? "bg-warning-100 text-warning-700"
                    : "bg-success-100 text-success-700"
              }`}
            >
              {item.quantity}
            </span>
            {(isLowStock || isOutOfStock) && (
              <ExclamationTriangleIcon
                className={`w-4 h-4 ${isOutOfStock ? "text-error-500" : "text-warning-500"}`}
              />
            )}
          </div>
        );
      },
    },
    {
      key: "min_stock",
      title: "Seuil Min.",
      align: "center" as const,
      render: (_: unknown, record: Record<string, unknown>) => {
        const item = record as unknown as StockItem;
        return <span className="text-gray-600">{item.min_stock}</span>;
      },
    },
    {
      key: "tenant",
      title: "Commerce",
      render: (_: unknown, record: Record<string, unknown>) => {
        const item = record as unknown as StockItem;
        return (
          <span className="text-sm text-gray-600">{item.tenant?.name}</span>
        );
      },
    },
    {
      key: "actions",
      title: "Actions",
      align: "center" as const,
      render: (_: unknown, record: Record<string, unknown>) => {
        return (
          <div className="flex items-center justify-center gap-2">
            <Button variant="outline" size="sm" className="text-success-600">
              <ArrowUpIcon className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" className="text-error-600">
              <ArrowDownIcon className="w-4 h-4" />
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
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Stocks</h1>
          <p className="text-gray-600 mt-1">
            Suivez et gérez les niveaux de stock de tous les produits
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <ArrowUpIcon className="w-5 h-5" />
          Réapprovisionner
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Références</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {stockItems.length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-success-500 rounded-full"></div>
            <p className="text-sm text-gray-500">Stock Sain</p>
          </div>
          <p className="text-2xl font-bold text-success-600 mt-1">
            {healthyStockItems.length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-warning-500 rounded-full"></div>
            <p className="text-sm text-gray-500">Stock Faible</p>
          </div>
          <p className="text-2xl font-bold text-warning-600 mt-1">
            {lowStockItems.length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-error-500 rounded-full"></div>
            <p className="text-sm text-gray-500">Rupture de Stock</p>
          </div>
          <p className="text-2xl font-bold text-error-600 mt-1">
            {outOfStockItems.length}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("inventory")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "inventory"
                ? "border-brand-500 text-brand-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Inventaire
          </button>
          <button
            onClick={() => setActiveTab("movements")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "movements"
                ? "border-brand-500 text-brand-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Mouvements
          </button>
        </nav>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6">
          {error ? (
            <div className="text-center py-8">
              <p className="text-error-600 mb-4">
                Erreur lors du chargement du stock
              </p>
              <Button variant="outline" onClick={() => refetch()}>
                Réessayer
              </Button>
            </div>
          ) : activeTab === "inventory" ? (
            <DataTable
              data={stockItems}
              columns={columns}
              loading={isLoading}
              emptyMessage="Aucun produit en stock"
            />
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>Historique des mouvements de stock</p>
              <p className="text-sm mt-2">Fonctionnalité en cours de développement</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
