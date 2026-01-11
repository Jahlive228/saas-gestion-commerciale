"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { TenantStatus } from '@prisma/client';
import { PlusIcon, PencilIcon, TrashBinIcon } from '@/icons/index';
import { 
  getTenantsAction, 
  createTenantAction, 
  updateTenantAction, 
  suspendTenantAction, 
  activateTenantAction,
  deleteTenantAction 
} from '../_services/actions';
import type { TenantWithStats, CreateTenantFormData, UpdateTenantFormData } from '../_services/types';
import TenantModal from '../_components/TenantModal';
import { toast } from 'react-hot-toast';

export default function TenantsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [tenants, setTenants] = useState<TenantWithStats[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TenantStatus | ''>('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<TenantWithStats | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadTenants = useCallback(async () => {
    setIsLoading(true);
    const result = await getTenantsAction(
      page,
      10,
      search || undefined,
      statusFilter || undefined
    );
    
    if (result.success) {
      setTenants(result.data.tenants);
      setTotal(result.data.total);
      setTotalPages(result.data.totalPages);
    } else {
      toast.error(result.error);
    }
    setIsLoading(false);
  }, [page, search, statusFilter]);

  useEffect(() => {
    loadTenants();
  }, [loadTenants]);

  // Ouvrir le modal si action=create dans l'URL
  useEffect(() => {
    if (searchParams.get('action') === 'create') {
      setIsModalOpen(true);
      setEditingTenant(null);
    }
  }, [searchParams]);

  const handleCreate = async (data: CreateTenantFormData) => {
    setIsSubmitting(true);
    const result = await createTenantAction(data);
    
    if (result.success) {
      toast.success('Commerce créé avec succès');
      setIsModalOpen(false);
      router.push('/superadmin/tenants');
      loadTenants();
    } else {
      toast.error(result.error);
    }
    setIsSubmitting(false);
  };

  const handleUpdate = async (data: UpdateTenantFormData) => {
    if (!editingTenant) return;
    
    setIsSubmitting(true);
    const result = await updateTenantAction(editingTenant.id, data);
    
    if (result.success) {
      toast.success('Commerce mis à jour avec succès');
      setIsModalOpen(false);
      setEditingTenant(null);
      loadTenants();
    } else {
      toast.error(result.error);
    }
    setIsSubmitting(false);
  };

  const handleToggleStatus = async (tenant: TenantWithStats) => {
    const action = tenant.status === TenantStatus.ACTIVE 
      ? suspendTenantAction 
      : activateTenantAction;
    
    const result = await action(tenant.id);
    
    if (result.success) {
      toast.success(
        tenant.status === TenantStatus.ACTIVE 
          ? 'Commerce suspendu' 
          : 'Commerce activé'
      );
      loadTenants();
    } else {
      toast.error(result.error);
    }
  };

  const handleDelete = async (tenant: TenantWithStats) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${tenant.name}" ?`)) {
      return;
    }
    
    const result = await deleteTenantAction(tenant.id);
    
    if (result.success) {
      toast.success('Commerce supprimé');
      loadTenants();
    } else {
      toast.error(result.error);
    }
  };

  const getStatusBadge = (status: TenantStatus) => {
    switch (status) {
      case TenantStatus.ACTIVE:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-success-50 text-success-700">
            <span className="w-1.5 h-1.5 bg-success-500 rounded-full" />
            Actif
          </span>
        );
      case TenantStatus.SUSPENDED:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-error-50 text-error-700">
            <span className="w-1.5 h-1.5 bg-error-500 rounded-full" />
            Suspendu
          </span>
        );
      case TenantStatus.INACTIVE:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
            Inactif
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Commerces</h1>
          <p className="text-sm text-gray-500 mt-1">
            {total} commerce{total > 1 ? 's' : ''} au total
          </p>
        </div>
        <button
          onClick={() => {
            setEditingTenant(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-500 text-white rounded-lg font-medium hover:bg-brand-600 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          Nouveau Commerce
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Rechercher un commerce..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as TenantStatus | '');
            setPage(1);
          }}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
        >
          <option value="">Tous les statuts</option>
          <option value={TenantStatus.ACTIVE}>Actifs</option>
          <option value={TenantStatus.SUSPENDED}>Suspendus</option>
          <option value={TenantStatus.INACTIVE}>Inactifs</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-theme-xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mx-auto"></div>
          </div>
        ) : tenants.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {search || statusFilter ? 'Aucun commerce trouvé' : 'Aucun commerce créé'}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Commerce
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Utilisateurs
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Produits
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ventes
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {tenants.map((tenant) => (
                    <tr key={tenant.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{tenant.name}</p>
                          <p className="text-xs text-gray-500">{tenant.slug}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm text-gray-600">{tenant.email || '-'}</p>
                          <p className="text-xs text-gray-500">{tenant.phone || '-'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-sm text-gray-600">{tenant._count.users}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-sm text-gray-600">{tenant._count.products}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-sm text-gray-600">{tenant._count.sales}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {getStatusBadge(tenant.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingTenant(tenant);
                              setIsModalOpen(true);
                            }}
                            className="p-2 text-gray-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                            title="Modifier"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(tenant)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                              tenant.status === TenantStatus.ACTIVE
                                ? 'text-warning-700 bg-warning-50 hover:bg-warning-100'
                                : 'text-success-700 bg-success-50 hover:bg-success-100'
                            }`}
                          >
                            {tenant.status === TenantStatus.ACTIVE ? 'Suspendre' : 'Activer'}
                          </button>
                          {tenant._count.users === 0 && tenant._count.products === 0 && tenant._count.sales === 0 && (
                            <button
                              onClick={() => handleDelete(tenant)}
                              className="p-2 text-gray-500 hover:text-error-600 hover:bg-error-50 rounded-lg transition-colors"
                              title="Supprimer"
                            >
                              <TrashBinIcon className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Page {page} sur {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Précédent
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      <TenantModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTenant(null);
          router.push('/superadmin/tenants');
        }}
        tenant={editingTenant}
        onSubmit={editingTenant ? handleUpdate : handleCreate}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
