import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

// Types génériques pour le tableau
export interface Column<T> {
  key: keyof T | string;
  title: string;
  width?: string;
  render?: (value: unknown, record: T, index: number) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  minWidth?: string;
  onSort?: (key: string, order: 'asc' | 'desc') => void;
  sortConfig?: {
    key: string;
    order: 'asc' | 'desc';
  };
}

function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  loading = false,
  emptyMessage = "Aucune donnée disponible",
  className = "",
  minWidth = "1102px",
  onSort,
  sortConfig,
}: DataTableProps<T>) {
  const handleSort = (column: Column<T>) => {
    if (!column.sortable || !onSort) return;
    
    const newOrder = sortConfig?.key === column.key && sortConfig?.order === 'asc' ? 'desc' : 'asc';
    onSort(column.key as string, newOrder);
  };

  const getSortIcon = (column: Column<T>) => {
    if (!column.sortable) return null;
    
    const isActive = sortConfig?.key === column.key;
    const isAsc = sortConfig?.order === 'asc';
    
    return (
      <span className="ml-1 inline-flex flex-col">
        <svg
          className={`w-3 h-3 ${isActive && !isAsc ? 'text-brand-500' : 'text-gray-400'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        <svg
          className={`w-3 h-3 -mt-1 ${isActive && isAsc ? 'text-brand-500' : 'text-gray-400'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </span>
    );
  };

  const getAlignmentClass = (align?: 'left' | 'center' | 'right') => {
    switch (align) {
      case 'center': return 'text-center';
      case 'right': return 'text-right';
      default: return 'text-start';
    }
  };

  const getNestedValue = (obj: T, path: string): unknown => {
    return path.split('.').reduce((current: unknown, key: string) => {
      return current && typeof current === 'object' && key in current 
        ? (current as Record<string, unknown>)[key] 
        : undefined;
    }, obj);
  };

  if (loading) {
    return (
      <div className={`overflow-hidden rounded-xl border border-gray-200 bg-white ${className}`}>
        <div className="max-w-full overflow-x-auto">
          <div style={{ minWidth }}>
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-500">
                  Chargement des données...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden rounded-xl border border-gray-200 bg-white ${className}`}>
      <div className="max-w-full overflow-x-auto">
        <div style={{ minWidth }}>
          <Table>
            {/* Table Header */}
            <TableHeader className="border-b border-gray-100">
              <TableRow>
                {columns.map((column, index) => (
                  <TableCell
                    key={index}
                    isHeader
                    className={`px-5 py-3 font-medium text-gray-500 text-theme-xs ${getAlignmentClass(column.align)} ${
                      column.sortable ? 'cursor-pointer hover:text-gray-700' : ''
                    }`}
                    style={{ width: column.width }}
                    onClick={() => handleSort(column)}
                  >
                    <div className="flex items-center">
                      {column.title}
                      {getSortIcon(column)}
                    </div>
                  </TableCell>
                ))}
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100">
              {data.length === 0 ? (
                <TableRow>
                  <TableCell 
                    colSpan={columns.length}
                    className="px-5 py-12 text-center text-gray-500"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <svg
                        className="w-12 h-12 text-gray-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                        />
                      </svg>
                      <p className="text-sm">{emptyMessage}</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                data.map((record, index) => (
                  <TableRow key={index} className="hover:bg-gray-50">
                    {columns.map((column, colIndex) => {
                      const value = typeof column.key === 'string' && column.key.includes('.') 
                        ? getNestedValue(record, column.key)
                        : record[column.key];
                      
                      return (
                        <TableCell
                          key={colIndex}
                          className={`px-5 py-4 sm:px-6 ${getAlignmentClass(column.align)}`}
                        >
                          {column.render ? column.render(value, record, index) : (value as React.ReactNode)}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

export default DataTable;
