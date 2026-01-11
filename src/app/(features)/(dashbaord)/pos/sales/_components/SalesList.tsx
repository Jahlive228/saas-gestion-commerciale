"use client";

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMySalesAction, getSaleDetailAction } from '../../_services/actions';
import { ReceiptIcon, EyeIcon } from '@/icons/index';
import Button from '@/components/ui/button/Button';
import { Modal } from '@/components/ui/modal/index';
import type { Sale, SaleDetail } from '../../_services/actions';

export default function SalesList() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSale, setSelectedSale] = useState<SaleDetail | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const { data: salesResponse, isLoading, error } = useQuery({
    queryKey: ['my-sales', currentPage],
    queryFn: () => getMySalesAction(currentPage, 20),
    staleTime: 30 * 1000, // 30 secondes
  });

  const sales = salesResponse?.success ? salesResponse.data?.sales || [] : [];
  const pagination = salesResponse?.success ? salesResponse.data?.pagination : null;

  const handleViewDetails = async (sale: Sale) => {
    const result = await getSaleDetailAction(sale.id);
    if (result.success && result.data) {
      setSelectedSale(result.data);
      setIsDetailModalOpen(true);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 shadow-theme-xs">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-600">
            Erreur lors du chargement des ventes
          </div>
        ) : sales.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <ReceiptIcon className="w-16 h-16 mb-4 text-gray-300" />
            <p className="text-sm">Aucune vente enregistrée</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Référence
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Articles
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Montant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-medium text-gray-900">{sale.reference}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(sale.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {sale.items_count} article(s)
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(sale.total_amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                            sale.status === 'COMPLETED'
                              ? 'bg-green-100 text-green-800'
                              : sale.status === 'PENDING'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {sale.status === 'COMPLETED'
                            ? 'Terminée'
                            : sale.status === 'PENDING'
                              ? 'En attente'
                              : 'Annulée'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(sale)}
                          className="flex items-center gap-2"
                        >
                          <EyeIcon className="w-4 h-4" />
                          Détails
                        </Button>
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
                  Page {pagination.current_page} sur {pagination.total_pages} ({pagination.total_count} ventes)
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
                    onClick={() => setCurrentPage((p) => Math.min(pagination.total_pages, p + 1))}
                    disabled={currentPage === pagination.total_pages}
                  >
                    Suivant
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de détails */}
      {selectedSale && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedSale(null);
          }}
          className="max-w-2xl"
        >
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Détails de la vente {selectedSale.reference}
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium">{formatDate(selectedSale.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Vendeur</p>
                  <p className="font-medium">
                    {selectedSale.seller.first_name} {selectedSale.seller.last_name}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-2">Articles</p>
                <div className="space-y-2">
                  {selectedSale.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{item.product.name}</p>
                        {item.product.sku && (
                          <p className="text-xs text-gray-500">SKU: {item.product.sku}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          {item.quantity} × {formatCurrency(item.unit_price)}
                        </p>
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(item.total_price)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-brand-600">
                    {formatCurrency(selectedSale.total_amount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
