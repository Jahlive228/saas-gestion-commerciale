"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-hot-toast";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { Modal } from "@/components/ui/modal/index";
import { createProductAction, getCategoriesAction, type Product } from "../_services/actions";
import { ScaleUnit } from "@prisma/client";

// Schéma de validation
const productSchema = z.object({
  name: z
    .string()
    .min(1, "Le nom du produit est obligatoire.")
    .min(2, "Le nom doit contenir au moins 2 caractères."),
  sku: z.string().optional(),
  description: z.string().optional(),
  price: z
    .number({ required_error: "Le prix est obligatoire." })
    .min(0, "Le prix doit être positif."),
  cost_price: z.number().min(0, "Le prix de revient doit être positif.").optional(),
  stock_qty: z.number().min(0, "La quantité en stock doit être positive.").optional(),
  min_stock: z.number().min(0, "Le stock minimum doit être positif.").optional(),
  unit: z.nativeEnum(ScaleUnit).optional(),
  category_id: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
  onSuccess?: () => void;
}

export default function ProductModal({
  isOpen,
  onClose,
  product,
  onSuccess,
}: ProductModalProps) {
  const isEditing = !!product;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      sku: "",
      description: "",
      price: 0,
      cost_price: undefined,
      stock_qty: 0,
      min_stock: 5,
      unit: ScaleUnit.PIECE,
      category_id: undefined,
    },
  });

  // Charger les catégories
  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  // Réinitialiser le formulaire quand le modal s'ouvre
  useEffect(() => {
    if (isOpen) {
      if (isEditing && product) {
        reset({
          name: product.name,
          sku: product.sku || "",
          description: product.description || "",
          price: product.price,
          cost_price: product.cost_price || undefined,
          stock_qty: product.stock_qty,
          min_stock: product.min_stock,
          unit: ScaleUnit.PIECE, // Par défaut
          category_id: product.category?.id || undefined,
        });
      } else {
        reset({
          name: "",
          sku: "",
          description: "",
          price: 0,
          cost_price: undefined,
          stock_qty: 0,
          min_stock: 5,
          unit: ScaleUnit.PIECE,
          category_id: undefined,
        });
      }
    }
  }, [isOpen, isEditing, product, reset]);

  const loadCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const result = await getCategoriesAction();
      if (result.success && result.data) {
        setCategories(result.data);
      }
    } catch (error: any) {
      console.error("[ProductModal] Erreur lors du chargement des catégories:", error);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    try {
      if (isEditing) {
        // TODO: Implémenter updateProductAction si nécessaire
        toast.error("La modification de produit n'est pas encore implémentée");
        return;
      }

      const result = await createProductAction(data);

      if (result.success) {
        toast.success("Produit créé avec succès !");
        onSuccess?.();
        onClose();
      } else {
        toast.error(result.error || "Erreur lors de la création du produit");
      }
    } catch (error: any) {
      console.error("[ProductModal] Erreur:", error);
      toast.error(error.message || "Erreur lors de la création du produit");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl">
      <div className="relative w-full bg-white rounded-xl shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEditing ? "Modifier le produit" : "Nouveau produit"}
          </h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Nom */}
          <div>
            <Label>
              Nom du produit <span className="text-error-500">*</span>
            </Label>
            <Input
              {...register("name")}
              error={!!errors.name}
              hint={errors.name?.message}
              placeholder="Ex: Lait 1L"
            />
          </div>

          {/* SKU */}
          <div>
            <Label>SKU (Code produit)</Label>
            <Input
              {...register("sku")}
              error={!!errors.sku}
              hint={errors.sku?.message}
              placeholder="Ex: LA-001"
            />
          </div>

          {/* Description */}
          <div>
            <Label>Description</Label>
            <textarea
              {...register("description")}
              rows={3}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 ${
                errors.description ? "border-error-500" : "border-gray-300"
              }`}
              placeholder="Description du produit..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-error-500">{errors.description.message}</p>
            )}
          </div>

          {/* Prix et Prix de revient */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>
                Prix de vente <span className="text-error-500">*</span>
              </Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                {...register("price", { valueAsNumber: true })}
                error={!!errors.price}
                hint={errors.price?.message}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label>Prix de revient</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                {...register("cost_price", { valueAsNumber: true })}
                error={!!errors.cost_price}
                hint={errors.cost_price?.message}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Quantité en stock</Label>
              <Input
                type="number"
                min="0"
                {...register("stock_qty", { valueAsNumber: true })}
                error={!!errors.stock_qty}
                hint={errors.stock_qty?.message}
                placeholder="0"
              />
            </div>
            <div>
              <Label>Stock minimum</Label>
              <Input
                type="number"
                min="0"
                {...register("min_stock", { valueAsNumber: true })}
                error={!!errors.min_stock}
                hint={errors.min_stock?.message}
                placeholder="5"
              />
            </div>
          </div>

          {/* Unité et Catégorie */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Unité de mesure</Label>
              <select
                {...register("unit")}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 ${
                  errors.unit ? "border-error-500" : "border-gray-300"
                }`}
              >
                <option value={ScaleUnit.PIECE}>Pièce</option>
                <option value={ScaleUnit.KG}>Kilogramme</option>
                <option value={ScaleUnit.LITRE}>Litre</option>
                <option value={ScaleUnit.METRE}>Mètre</option>
              </select>
              {errors.unit && (
                <p className="mt-1 text-sm text-error-500">{errors.unit.message}</p>
              )}
            </div>
            <div>
              <Label>Catégorie</Label>
              <select
                {...register("category_id")}
                disabled={isLoadingCategories}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 ${
                  errors.category_id ? "border-error-500" : "border-gray-300"
                } ${isLoadingCategories ? "bg-gray-100 cursor-not-allowed" : ""}`}
              >
                <option value="">Aucune catégorie</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.category_id && (
                <p className="mt-1 text-sm text-error-500">{errors.category_id.message}</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting} loading={isSubmitting}>
              {isEditing ? "Modifier" : "Créer"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
