"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import DataTable from "@/components/common/DataTable";
import Button from "@/components/ui/button/Button";
import { PlusIcon } from "@heroicons/react/24/outline";
import { getProductsAction, type Product } from "./_services/actions";
import { CanAccess } from "@/components/permissions/CanAccess";
import { PERMISSION_CODES } from "@/constants/permissions-saas";
import ProductModal from "./_components/ProductModal";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const loadProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getProductsAction();
      if (result && result.success && result.data) {
        setProducts(result.data);
      } else {
        setError(result?.error || "Erreur lors du chargement");
      }
    } catch (error: any) {
      console.error('Erreur lors du chargement des produits:', error);
      setError(error.message || "Erreur lors du chargement");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleCreateProduct = useCallback(() => {
    setEditingProduct(null);
    setIsModalOpen(true);
  }, []);

  const handleEditProduct = useCallback((product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setEditingProduct(null);
  }, []);

  const handleModalSuccess = useCallback(() => {
    loadProducts();
  }, []);

  const columns = useMemo(() => [
    {
      key: "name",
      title: "Produit",
      render: (_: unknown, record: Record<string, unknown>) => {
        const product = record as unknown as Product;
        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center">
              <span className="text-brand-600 font-semibold text-sm">
                {product.name.substring(0, 2).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-medium text-gray-900">{product.name}</p>
              <p className="text-xs text-gray-500">SKU: {product.sku || "N/A"}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: "category",
      title: "Catégorie",
      render: (_: unknown, record: Record<string, unknown>) => {
        const product = record as unknown as Product;
        return (
          <span className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-700">
            {product.category?.name || "Non catégorisé"}
          </span>
        );
      },
    },
    {
      key: "price",
      title: "Prix",
      align: "right" as const,
      render: (_: unknown, record: Record<string, unknown>) => {
        const product = record as unknown as Product;
        return (
          <span className="font-semibold text-gray-900">
            {new Intl.NumberFormat("fr-FR", {
              style: "currency",
              currency: "XOF",
              minimumFractionDigits: 0,
            }).format(product.price)}
          </span>
        );
      },
    },
    {
      key: "stock_qty",
      title: "Stock",
      align: "center" as const,
      render: (_: unknown, record: Record<string, unknown>) => {
        const product = record as unknown as Product;
        const isLowStock = product.stock_qty <= product.min_stock && product.stock_qty > 0;
        const isOutOfStock = product.stock_qty === 0;
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              isOutOfStock
                ? "bg-error-50 text-error-700"
                : isLowStock
                  ? "bg-warning-50 text-warning-700"
                  : "bg-success-50 text-success-700"
            }`}
          >
            {product.stock_qty} unités
          </span>
        );
      },
    },
    {
      key: "tenant",
      title: "Commerce",
      render: (_: unknown, record: Record<string, unknown>) => {
        const product = record as unknown as Product;
        return (
          <span className="text-sm text-gray-600">{product.tenant?.name}</span>
        );
      },
    },
  ], []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produits</h1>
          <p className="text-gray-600 mt-1">
            Gérez tous les produits de la plateforme
          </p>
        </div>
        <CanAccess permission={PERMISSION_CODES.PRODUCTS_CREATE}>
          <Button 
            onClick={handleCreateProduct}
            className="flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Nouveau Produit
          </Button>
        </CanAccess>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Produits</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {products.length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Stock Sain</p>
          <p className="text-2xl font-bold text-success-600 mt-1">
            {products.filter((p) => p.stock_qty > p.min_stock).length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Stock Faible</p>
          <p className="text-2xl font-bold text-warning-600 mt-1">
            {products.filter((p) => p.stock_qty <= p.min_stock && p.stock_qty > 0).length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Rupture de Stock</p>
          <p className="text-2xl font-bold text-error-600 mt-1">
            {products.filter((p) => p.stock_qty === 0).length}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6">
          {error ? (
            <div className="text-center py-8">
              <p className="text-error-600 mb-4">{error}</p>
              <Button variant="outline" onClick={loadProducts}>
                Réessayer
              </Button>
            </div>
          ) : (
            <DataTable
              data={products}
              columns={columns}
              loading={isLoading}
              emptyMessage="Aucun produit trouvé"
            />
          )}
        </div>
      </div>

      {/* Product Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        product={editingProduct}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
}
