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

const getNestedValue = (obj: Record<string, unknown>, path: string): unknown => {
  return path.split('.').reduce<unknown>((value, key) => {
    if (typeof value === 'object' && value !== null) {
      return (value as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
};

const toTimestamp = (value: unknown): number | null => {
  if (value instanceof Date) {
    return value.getTime();
  }
  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value).getTime();
    return isNaN(parsed) ? null : parsed;
  }
  if (typeof value === 'object' && value !== null && 'seconds' in value) {
    const seconds = (value as { seconds?: unknown }).seconds;
    if (typeof seconds === 'number') {
      return seconds * 1000;
    }
  }
  return null;
};

export function useTableSort<T extends Record<string, unknown>>({
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
      let aValue: unknown = a[sortKey as keyof T];
      let bValue: unknown = b[sortKey as keyof T];

      // Handle nested properties (e.g., 'user.name')
      if (sortKey.includes('.')) {
        aValue = getNestedValue(a, sortKey);
        bValue = getNestedValue(b, sortKey);
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
      const aTime = toTimestamp(aValue);
      const bTime = toTimestamp(bValue);
      if (aTime !== null || bTime !== null) {
        if (aTime === null) return sortDirection === 'asc' ? 1 : -1;
        if (bTime === null) return sortDirection === 'asc' ? -1 : 1;
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
