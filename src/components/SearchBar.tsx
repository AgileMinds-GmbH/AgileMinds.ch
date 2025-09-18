import React from 'react';
import { Search } from 'lucide-react';
import FilterButton from './filters/FilterButton';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  activeFiltersCount: number;
  isFilterOpen: boolean;
  onFilterClick: () => void;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = 'Search...',
  activeFiltersCount,
  isFilterOpen,
  onFilterClick
}: SearchBarProps) {
  return (
    <div className="w-full flex items-center gap-4">
      <div className="relative flex-1">
        <Search 
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" 
          aria-hidden="true"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-12 pr-4 h-12 border border-gray-300 rounded-lg 
            focus:ring-2 focus:ring-indigo-600 focus:border-transparent
            text-gray-900 placeholder-gray-500
            transition duration-200
            text-base md:text-lg"
          aria-label={placeholder}
        />
      </div>
      <div className="flex-shrink-0">
        <FilterButton
          activeFiltersCount={activeFiltersCount}
          isOpen={isFilterOpen}
          onClick={onFilterClick}
        />
      </div>
    </div>
  );
}