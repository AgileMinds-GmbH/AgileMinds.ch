import { useState, useEffect } from 'react';

export type SortConfig = {
  key: string;
  direction: 'asc' | 'desc';
};

export function useSortableTable<T>(initialData: T[], initialSort?: SortConfig) {
  const [sortConfig, setSortConfig] = useState<SortConfig | undefined>(
    initialSort || loadSavedSort()
  );
  const [data, setData] = useState<T[]>(initialData);

  // Load saved sort configuration from localStorage
  function loadSavedSort(): SortConfig | undefined {
    const saved = localStorage.getItem('tableSortConfig');
    return saved ? JSON.parse(saved) : undefined;
  }

  // Save sort configuration to localStorage
  useEffect(() => {
    if (sortConfig) {
      localStorage.setItem('tableSortConfig', JSON.stringify(sortConfig));
    }
  }, [sortConfig]);

  // Sort data when configuration changes
  useEffect(() => {
    if (!sortConfig) {
      setData(initialData);
      return;
    }

    const sortedData = [...initialData].sort((a, b) => {
      const aValue = a[sortConfig.key as keyof T];
      const bValue = b[sortConfig.key as keyof T];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc'
          ? aValue - bValue
          : bValue - aValue;
      }

      return 0;
    });

    setData(sortedData);
  }, [initialData, sortConfig]);

  const requestSort = (key: string) => {
    setSortConfig(current => ({
      key,
      direction:
        current?.key === key && current.direction === 'asc'
          ? 'desc'
          : 'asc'
    }));
  };

  return {
    items: data,
    sortConfig,
    requestSort
  };
}