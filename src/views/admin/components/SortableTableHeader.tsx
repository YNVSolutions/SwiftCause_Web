import React from 'react';
import { TableHead } from '../../../shared/ui/table';
import { ChevronUp, ChevronDown } from 'lucide-react';

export type SortDirection = 'asc' | 'desc' | null;

interface SortableTableHeaderProps {
  children: React.ReactNode;
  sortKey: string;
  currentSortKey: string | null;
  currentSortDirection: SortDirection;
  onSort: (key: string) => void;
  className?: string;
  sortable?: boolean;
}

export function SortableTableHeader({
  children,
  sortKey,
  currentSortKey,
  currentSortDirection,
  onSort,
  className = "",
  sortable = true
}: SortableTableHeaderProps) {
  const isActive = currentSortKey === sortKey;
  const isAscending = isActive && currentSortDirection === 'asc';
  const isDescending = isActive && currentSortDirection === 'desc';

  if (!sortable) {
    return (
      <TableHead className={className}>
        {children}
      </TableHead>
    );
  }

  return (
    <TableHead
      className={`${className} cursor-pointer select-none`}
      onClick={() => onSort(sortKey)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSort(sortKey);
        }
      }}
      tabIndex={0}
      role="button"
      aria-sort={
        isActive 
          ? (isAscending ? 'ascending' : 'descending')
          : 'none'
      }
    >
      <div className="flex items-center gap-2">
        {children}
        <div className="flex flex-col flex-shrink-0">
          <ChevronUp 
            className={`w-3 h-3 transition-colors ${
              isAscending 
                ? 'text-indigo-600' 
                : 'text-gray-400'
            }`}
          />
          <ChevronDown 
            className={`w-3 h-3 -mt-1 transition-colors ${
              isDescending 
                ? 'text-indigo-600' 
                : 'text-gray-400'
            }`}
          />
        </div>
      </div>
    </TableHead>
  );
}
