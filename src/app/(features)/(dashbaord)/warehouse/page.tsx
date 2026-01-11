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
import { getStockAction, type StockItem } from "./_services/actions";
import StockTransactionModal from "./_components/StockTransactionModal";
import StockHistory from "./_components/StockHistory";
import { TransactionType } from "@prisma/client";
export default function WarehousePage() {
  const [activeTab, setActiveTab] = useState<"inventory" | "movements">(
    "inventory"
  );
  const [selectedProduct, setSelectedProduct] = useState<{
    id: string;
    name: string;
    stock: number;
  } | null>(null);
  const [transactionType, setTransactionType] = useState<TransactionType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: stockResponse, isLoading, error, refetch } = useQuery({
    queryKey: ["stock"],
    queryFn: () => getStockAction(),
    staleTime: 30 * 1000, // 30 secondes
  });

  const stockItems = stockResponse?.success ? stockResponse.data || [] : [];

  const lowStockItems = stockItems.filter(
    (item) => item.stock_qty <= item.min_stock && item.stock_qty > 0
  );
  const outOfStockItems = stockItems.filter((item) => item.stock_qty === 0);
  const healthyStockItems = stockItems.filter(
    (item) => item.stock_qty > item.min_stock
  );

  const handleOpenModal = (
    product: StockItem,
    type: TransactionType
  ) => {
    setSelectedProduct({
      id: product.id,
      name: product.name,
      stock: product.stock_qty,
    });
    setTransactionType(type);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    setTransactionType(null);
  };

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
              <p className="text-xs text-gray-500">SKU: {item.sku || "N/A"}</p>
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
      key: "stock_qty",
      title: "Quantité",
      align: "center" as const,
      render: (_: unknown, record: Record<string, unknown>) => {
        const item = record as unknown as StockItem;
        const isLowStock = item.stock_qty <= item.min_stock && item.stock_qty > 0;
        const isOutOfStock = item.stock_qty === 0;

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
              {item.stock_qty}
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
      key: "actions",
      title: "Actions",
      align: "center" as const,
      render: (_: unknown, record: Record<string, unknown>) => {
        const item = record as unknown as StockItem;
        return (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-success-600"
              onClick={() => handleOpenModal(item, TransactionType.RESTOCK)}
              title="Réapprovisionner"
            >
              <ArrowUpIcon className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-warning-600"
              onClick={() => handleOpenModal(item, TransactionType.ADJUSTMENT)}
              title="Ajuster"
            >
              <ArrowDownIcon className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-blue-600"
              onClick={() => handleOpenModal(item, TransactionType.RETURN)}
              title="Retour client"
            >
              <ArrowDownIcon className="w-4 h-4 rotate-180" />
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
          <h1 className="text-2xl font-bold text-gray-900">Entrepôt</h1>
          <p className="text-gray-600 mt-1">
            Gérez les stocks et les mouvements d'inventaire
          </p>
        </div>
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

      {/* Content */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6">
          {error ? (
            <div className="text-center py-8">
              <p className="text-error-600 mb-4">
                {typeof error === "string" ? error : "Erreur lors du chargement"}
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
            <StockHistory />
          )}
        </div>
      </div>

      {/* Transaction Modal */}
      {selectedProduct && transactionType && (
        <StockTransactionModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          productId={selectedProduct.id}
          productName={selectedProduct.name}
          currentStock={selectedProduct.stock}
          transactionType={transactionType}
        />
      )}
    </div>
  );
}
