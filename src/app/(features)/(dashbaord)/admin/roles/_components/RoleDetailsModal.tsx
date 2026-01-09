import React from "react";
import { Modal } from "@/components/ui/modal/index";
import { useRoleDetails } from "../_services/queries";
import type { Role } from "../../utilisateurs/_services/types";

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
    role?.id || "",
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

            {/* Permissions associées */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                Permissions ({roleDetails.permissions?.length || 0})
              </h4>

              {roleDetails.permissions && roleDetails.permissions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {roleDetails.permissions.map((permission) => (
                    <div
                      key={permission.id}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <svg
                              className="w-4 h-4 text-green-600"
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
                          <div className="font-mono text-xs bg-gray-100 px-2 py-1 rounded text-gray-800 mb-2 inline-block">
                            {permission.code}
                          </div>
                          <h5 className="text-sm font-medium text-gray-900 mb-1">
                            {permission.name}
                          </h5>
                          <p className="text-xs text-gray-600">
                            {permission.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
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
