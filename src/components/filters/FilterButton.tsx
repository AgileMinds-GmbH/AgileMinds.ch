import React from 'react';
import { SlidersHorizontal } from 'lucide-react';

interface FilterButtonProps {
  activeFiltersCount: number;
  isOpen: boolean;
  onClick: () => void;
}

export default function FilterButton({ activeFiltersCount, isOpen, onClick }: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center gap-2 px-4 h-12 rounded-lg border
        transition-colors duration-200 relative
        ${isOpen 
          ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
        }
      `}
      aria-expanded={isOpen}
      aria-controls="filter-panel"
    >
      <SlidersHorizontal className="h-5 w-5" />
      <span className="font-medium">Filters</span>
      {activeFiltersCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
          {activeFiltersCount}
        </span>
      )}
    </button>
  );
}