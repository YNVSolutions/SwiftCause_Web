import { useState, useMemo } from 'react';

export type SortDirection = 'asc' | 'desc' | null;

interface UseTableSortProps<T> {
  data: T[];
  defaultSortKey?: string | null;
  defaultSortDirection?: SortDirection;
}

interface UseTableSortReturn<T> {
  sortedData: T[];
  sortKey: string | null;
  sortDirection: SortDirection;
  handleSort: (key: string) => void;
}

export function useTableSort<T extends Record<string, any>>({
  data,
  defaultSortKey = null,
  defaultSortDirection = null
}: UseTableSortProps<T>): UseTableSortReturn<T> {
  const [sortKey, setSortKey] = useState<string | null>(defaultSortKey);
  const [sortDirection, setSortDirection] = useState<SortDirection>(defaultSortDirection);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      // Same column clicked - cycle through directions
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortKey(null);
      } else {
        setSortDirection('asc');
      }
    } else {
      // New column clicked - start with ascending
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const sortedData = useMemo(() => {
    if (!sortKey || !sortDirection) {
      return data;
    }

    return [...data].sort((a, b) => {
      let aValue = a[sortKey];
      let bValue = b[sortKey];

      // Handle nested properties (e.g., 'user.name')
      if (sortKey.includes('.')) {
        const keys = sortKey.split('.');
        aValue = keys.reduce((obj, key) => obj?.[key], a);
        bValue = keys.reduce((obj, key) => obj?.[key], b);
      }

      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortDirection === 'asc' ? 1 : -1;
      if (bValue == null) return sortDirection === 'asc' ? -1 : 1;

      // Handle different data types
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.toLowerCase().localeCompare(bValue.toLowerCase());
        return sortDirection === 'asc' ? comparison : -comparison;
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        const comparison = aValue - bValue;
        return sortDirection === 'asc' ? comparison : -comparison;
      }

      // Handle dates (including Firestore Timestamps)
      if (aValue?.seconds || bValue?.seconds || aValue instanceof Date || bValue instanceof Date) {
        const aTime = aValue?.seconds ? aValue.seconds * 1000 : new Date(aValue).getTime();
        const bTime = bValue?.seconds ? bValue.seconds * 1000 : new Date(bValue).getTime();
        const comparison = aTime - bTime;
        return sortDirection === 'asc' ? comparison : -comparison;
      }

      // Fallback to string comparison
      const comparison = String(aValue).toLowerCase().localeCompare(String(bValue).toLowerCase());
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [data, sortKey, sortDirection]);

  return {
    sortedData,
    sortKey,
    sortDirection,
    handleSort
  };
}