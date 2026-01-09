"use client";

import React, { useState } from "react";
import RolesTable from "./_components/RolesTable";
import PermissionsTable from "./_components/PermissionsTable";

export default function RolesPage() {
  const [activeTab, setActiveTab] = useState<"roles" | "permissions">("roles");

  const tabs = [
    { id: "roles" as const, label: "Rôles", count: null },
    { id: "permissions" as const, label: "Permissions", count: null },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Gestion des Rôles et Permissions
          </h1>
          <p className="text-gray-600 mt-1">
            Gérez les rôles utilisateur et leurs permissions associées
          </p>
        </div>
      </div>

      {/* Navigation par onglets */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.label}
              {tab.count !== null && (
                <span className="ml-2 py-0.5 px-2 rounded-full text-xs bg-gray-100 text-gray-600">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Contenu des onglets */}
      <div className="space-y-6">
        {activeTab === "roles" && <RolesTable />}
        {activeTab === "permissions" && <PermissionsTable />}
      </div>
    </div>
  );
}
