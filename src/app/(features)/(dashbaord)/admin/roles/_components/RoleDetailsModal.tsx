import React from "react";
import { Modal } from "@/components/ui/modal/index";
import { useRoleDetails } from "../_services/queries";
import type { Role } from "../_services/types";

// Couleurs par module de permission
const MODULE_COLORS: Record<string, { bg: string; text: string }> = {
  tenants: { bg: 'bg-error-100', text: 'text-error-700' },
  users: { bg: 'bg-brand-100', text: 'text-brand-700' },
  products: { bg: 'bg-blue-light-100', text: 'text-blue-light-700' },
  categories: { bg: 'bg-orange-100', text: 'text-orange-700' },
  stock: { bg: 'bg-warning-100', text: 'text-warning-700' },
  sales: { bg: 'bg-success-100', text: 'text-success-700' },
  stats: { bg: 'bg-theme-purple-500/20', text: 'text-theme-purple-500' },
  roles: { bg: 'bg-gray-100', text: 'text-gray-700' },
  permissions: { bg: 'bg-gray-100', text: 'text-gray-700' },
};

interface RoleDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role | null;
}

export default function RoleDetailsModal({
  isOpen,
  onClose,
  role,
}: RoleDetailsModalProps) {
  const { data: roleDetailsResponse, isLoading } = useRoleDetails(
    role?.code || "",
    isOpen && !!role
  );

  const roleDetails = roleDetailsResponse?.content;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-4xl m-4">
      <div className="relative w-full max-w-4xl overflow-y-auto rounded-3xl bg-white p-6 max-h-[80vh]">
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-800">
            Détails du rôle
          </h3>
          <p className="text-sm text-gray-500">
            Informations complètes sur le rôle et ses permissions
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Chargement...</span>
          </div>
        ) : roleDetails ? (
          <div className="space-y-6">
            {/* Informations générales du rôle */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-lg font-medium text-gray-900 mb-3">
                Informations générales
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nom
                  </label>
                  <p className="mt-1 text-sm text-gray-900 capitalize">
                    {roleDetails.name}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {roleDetails.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Permissions associées groupées par module */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                Permissions ({roleDetails.permissions?.length || 0})
              </h4>

              {roleDetails.permissions && roleDetails.permissions.length > 0 ? (
                <div className="space-y-4">
                  {/* Grouper les permissions par module */}
                  {Object.entries(
                    roleDetails.permissions.reduce((acc: Record<string, typeof roleDetails.permissions>, perm) => {
                      const module = perm.module || 'other';
                      if (!acc[module]) acc[module] = [];
                      acc[module].push(perm);
                      return acc;
                    }, {})
                  ).map(([module, perms]) => {
                    const colors = MODULE_COLORS[module] || { bg: 'bg-gray-100', text: 'text-gray-700' };
                    return (
                      <div key={module} className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className={`${colors.bg} px-4 py-2`}>
                          <h5 className={`font-medium ${colors.text} capitalize`}>
                            {module} ({perms.length})
                          </h5>
                        </div>
                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                          {perms.map((permission) => (
                            <div
                              key={permission.id}
                              className="flex items-start space-x-2"
                            >
                              <div className="flex-shrink-0 mt-0.5">
                                <div className="w-5 h-5 bg-success-100 rounded-full flex items-center justify-center">
                                  <svg
                                    className="w-3 h-3 text-success-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900">
                                  {permission.name}
                                </p>
                                <p className="text-xs text-gray-500 font-mono">
                                  {permission.code}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Aucune permission associée à ce rôle
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-500">
              Impossible de charger les détails du rôle
            </div>
          </div>
        )}

        {/* Bouton de fermeture */}
        <div className="flex justify-end pt-6 border-t border-gray-200 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </Modal>
  );
}
