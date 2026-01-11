"use client";

import React, { useEffect, useState } from "react";
import DataTable from "@/components/common/DataTable";
import Button from "@/components/ui/button/Button";
import { PlusIcon, FolderIcon } from "@heroicons/react/24/outline";
import { getCategoriesAction, type Category } from "./_services/actions";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getCategoriesAction();
      if (result && result.success && result.data) {
        setCategories(result.data);
      } else {
        setError(result?.error || "Erreur lors du chargement");
      }
    } catch (error: any) {
      console.error('Erreur lors du chargement des catégories:', error);
      setError(error.message || "Erreur lors du chargement");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const columns = [
    {
      key: "name",
      title: "Catégorie",
      render: (_: unknown, record: Record<string, unknown>) => {
        const category = record as unknown as Category;
        return (
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{
                backgroundColor: category.color
                  ? `${category.color}20`
                  : "#f3f4f6",
              }}
            >
              <FolderIcon
                className="w-5 h-5"
                style={{ color: category.color || "#6b7280" }}
              />
            </div>
            <div>
              <p className="font-medium text-gray-900">{category.name}</p>
              <p className="text-xs text-gray-500">{category.slug}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: "description",
      title: "Description",
      render: (_: unknown, record: Record<string, unknown>) => {
        const category = record as unknown as Category;
        return (
          <span className="text-sm text-gray-600 max-w-xs truncate block">
            {category.description || "Aucune description"}
          </span>
        );
      },
    },
    {
      key: "products",
      title: "Produits",
      align: "center" as const,
      render: (_: unknown, record: Record<string, unknown>) => {
        const category = record as unknown as Category;
        return (
          <span className="px-2 py-1 bg-brand-50 text-brand-700 rounded-full text-xs font-medium">
            {category._count?.products || 0} produits
          </span>
        );
      },
    },
    {
      key: "tenant",
      title: "Commerce",
      render: (_: unknown, record: Record<string, unknown>) => {
        const category = record as unknown as Category;
        return (
          <span className="text-sm text-gray-600">{category.tenant?.name}</span>
        );
      },
    },
    {
      key: "color",
      title: "Couleur",
      align: "center" as const,
      render: (_: unknown, record: Record<string, unknown>) => {
        const category = record as unknown as Category;
        return category.color ? (
          <div className="flex items-center justify-center">
            <div
              className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
              style={{ backgroundColor: category.color }}
            />
          </div>
        ) : (
          <span className="text-xs text-gray-400">-</span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Catégories</h1>
          <p className="text-gray-600 mt-1">
            Gérez les catégories de produits de la plateforme
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <PlusIcon className="w-5 h-5" />
          Nouvelle Catégorie
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Catégories</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {categories.length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Avec Produits</p>
          <p className="text-2xl font-bold text-brand-600 mt-1">
            {categories.filter((c) => (c._count?.products || 0) > 0).length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Vides</p>
          <p className="text-2xl font-bold text-gray-400 mt-1">
            {categories.filter((c) => (c._count?.products || 0) === 0).length}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6">
          {error ? (
            <div className="text-center py-8">
              <p className="text-error-600 mb-4">{error}</p>
              <Button variant="outline" onClick={loadCategories}>
                Réessayer
              </Button>
            </div>
          ) : (
            <DataTable
              data={categories}
              columns={columns}
              loading={isLoading}
              emptyMessage="Aucune catégorie trouvée"
            />
          )}
        </div>
      </div>
    </div>
  );
}
