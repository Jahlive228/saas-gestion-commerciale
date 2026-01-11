"use client";

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getStockHistoryAction } from '../_services/actions';
import Button from '@/components/ui/button/Button';
import { TransactionType } from '@prisma/client';
import type { StockTransaction } from '../_services/actions';

const transactionTypeLabels: Record<TransactionType, string> = {
  RESTOCK: 'Réapprovisionnement',
  ADJUSTMENT: 'Ajustement',
  RETURN: 'Retour client',
  SALE: 'Vente',
};

const transactionTypeColors: Record<TransactionType, string> = {
  RESTOCK: 'bg-green-100 text-green-800',
  ADJUSTMENT: 'bg-yellow-100 text-yellow-800',
  RETURN: 'bg-blue-100 text-blue-800',
  SALE: 'bg-purple-100 text-purple-800',
};

export default function StockHistory({ productId }: { productId?: string }) {
  const [currentPage, setCurrentPage] = useState(1);

  const { data: historyResponse, isLoading, error } = useQuery({
    queryKey: ['stock-history', currentPage, productId],
    queryFn: () => getStockHistoryAction(currentPage, 20, productId),
    staleTime: 30 * 1000, // 30 secondes
  });

  const transactions = historyResponse?.success
    ? historyResponse.data?.transactions || []
    : [];
  const pagination = historyResponse?.success
    ? historyResponse.data?.pagination
    : null;

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatUserName = (user: StockTransaction['user']) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user.email;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-600">
        Erreur lors du chargement de l'historique
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>Aucun mouvement de stock enregistré</p>
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Produit
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantité
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Utilisateur
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Raison
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(transaction.created_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <p className="font-medium text-gray-900">
                      {transaction.product.name}
                    </p>
                    {transaction.product.sku && (
                      <p className="text-xs text-gray-500">
                        SKU: {transaction.product.sku}
                      </p>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                      transactionTypeColors[transaction.type]
                    }`}
                  >
                    {transactionTypeLabels[transaction.type]}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`font-semibold ${
                      transaction.quantity > 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {transaction.quantity > 0 ? '+' : ''}
                    {transaction.quantity}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatUserName(transaction.user)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {transaction.reason || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.total_pages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Page {pagination.current_page} sur {pagination.total_pages} (
            {pagination.total_count} mouvements)
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((p) =>
                  Math.min(pagination.total_pages, p + 1)
                )
              }
              disabled={currentPage === pagination.total_pages}
            >
              Suivant
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
