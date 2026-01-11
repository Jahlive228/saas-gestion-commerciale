"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/modal/index';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import { TransactionType } from '@prisma/client';
import { createStockTransactionAction } from '../_services/actions';
import { toast } from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';

interface StockTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  currentStock: number;
  transactionType: TransactionType;
}

const transactionSchema = z.object({
  quantity: z.number().int().min(1, 'La quantité doit être supérieure à 0'),
  reason: z.string().optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

const transactionTypeLabels: Record<TransactionType, string> = {
  RESTOCK: 'Réapprovisionnement',
  ADJUSTMENT: 'Ajustement',
  RETURN: 'Retour client',
  SALE: 'Vente',
};

const transactionTypeDescriptions: Record<TransactionType, string> = {
  RESTOCK: 'Ajouter des produits au stock (quantité positive)',
  ADJUSTMENT: 'Ajuster le stock (quantité positive ou négative)',
  RETURN: 'Retour de produits d\'un client (quantité positive)',
  SALE: 'Vente (quantité négative)',
};

export default function StockTransactionModal({
  isOpen,
  onClose,
  productId,
  productName,
  currentStock,
  transactionType,
}: StockTransactionModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
  });

  const onSubmit = async (data: TransactionFormData) => {
    setIsSubmitting(true);
    try {
      // Pour ADJUSTMENT, la quantité peut être négative
      // Pour RESTOCK et RETURN, la quantité doit être positive
      let quantity = data.quantity;
      if (transactionType === TransactionType.ADJUSTMENT && quantity < 0) {
        quantity = -Math.abs(quantity);
      } else {
        quantity = Math.abs(quantity);
      }

      const result = await createStockTransactionAction(
        productId,
        transactionType,
        quantity,
        data.reason
      );

      if (result.success) {
        toast.success(
          `${transactionTypeLabels[transactionType]} effectué avec succès`
        );
        reset();
        onClose();
        queryClient.invalidateQueries({ queryKey: ['stock'] });
        queryClient.invalidateQueries({ queryKey: ['stock-history'] });
      } else {
        toast.error(result.error);
      }
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-md">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {transactionTypeLabels[transactionType]}
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          {transactionTypeDescriptions[transactionType]}
        </p>

        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Produit:</span> {productName}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            <span className="font-medium">Stock actuel:</span> {currentStock}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="quantity">
              Quantité{' '}
              {transactionType === TransactionType.ADJUSTMENT
                ? '(positive ou négative)'
                : '(positive)'}
            </Label>
            <Input
              id="quantity"
              type="number"
              {...register('quantity', { valueAsNumber: true })}
              error={!!errors.quantity?.message}
              hint={errors.quantity?.message}
              placeholder="Ex: 10"
            />
          </div>

          <div>
            <Label htmlFor="reason">Raison (optionnel)</Label>
            <Input
              id="reason"
              type="text"
              {...register('reason')}
              error={!!errors.reason?.message}
              hint={errors.reason?.message}
              placeholder={
                transactionType === TransactionType.RESTOCK
                  ? 'Ex: Livraison fournisseur #123'
                  : transactionType === TransactionType.ADJUSTMENT
                    ? 'Ex: Perte, vol, casse'
                    : 'Ex: Retour client #456'
              }
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="flex-1"
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              Valider
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
