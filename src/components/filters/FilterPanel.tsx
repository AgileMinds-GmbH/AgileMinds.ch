import { X, ChevronRight } from 'lucide-react';
import { useGetExpertiseListQuery } from '../../redux/rtk/expertise';
import { Expertise } from '../../types/expertise';

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  selectedCategories: string[];
  setSelectedCategories: (categories: string[]) => void;
  dateRange: [string, string];
  setDateRange: (range: [string, string]) => void;
  selectedLanguages: string[];
  setSelectedLanguages: (languages: string[]) => void;
  showEarlyBirdOnly?: boolean;
  setShowEarlyBirdOnly?: (show: boolean) => void;
  onClearAll: () => void;
  maxPrice: number;
}

const LANGUAGES = [
  { code: 'all', name: 'All Languages' },
  { code: 'en', name: 'English' },
  { code: 'de', name: 'German' }
];

export default function FilterPanel({
  onClose,
  priceRange,
  setPriceRange,
  selectedCategories,
  setSelectedCategories,
  dateRange,
  setDateRange,
  selectedLanguages,
  setSelectedLanguages,
  showEarlyBirdOnly,
  setShowEarlyBirdOnly,
  onClearAll,
  maxPrice,
}: FilterPanelProps) {
  const { data: expertises = [], isLoading: expertiseLoader } = useGetExpertiseListQuery();

  const hasActiveFilters =
    priceRange[0] !== 0 ||
    priceRange[1] !== 1000 ||
    selectedCategories.length > 0 ||
    dateRange[0] !== '' || dateRange[1] !== '' ||
    (selectedLanguages.length > 0 && !selectedLanguages.includes('all')) ||
    showEarlyBirdOnly;

  const handlePriceChange = (type: 'min' | 'max', value: string) => {
    const numValue = Number(value);
    if (isNaN(numValue) || numValue < 0 || numValue > maxPrice) return;
    if (type === 'min') {
      setPriceRange([numValue, priceRange[1]]);
    } else {
      setPriceRange([priceRange[0], numValue]);
    }
  };

  return (
    <div
      id="filter-panel"
      className="transition-transform duration-300 ease-in-out"
    >
      <div className="bg-white border border-gray-200 rounded-lg mt-2 p-4 shadow-lg overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Filter Courses</h2>
          <div className="flex items-center gap-4">
            {hasActiveFilters && (
              <button
                onClick={onClearAll}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear all
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Close filters"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:gap-8">
          {/* Language Filter */}
          <div className="w-40 flex-shrink-0">
            <div className="mb-2">
              <h3 className="font-semibold text-gray-900">Language</h3>
            </div>
            <div className="relative">
              <select
                value={selectedLanguages[0] || 'all'}
                onChange={(e) => setSelectedLanguages([e.target.value])}
                className="w-full h-10 px-3 border border-gray-300 rounded-md
                  focus:ring-2 focus:ring-indigo-600 focus:border-transparent
                  appearance-none bg-white pr-10 text-sm"
                aria-label="Select course languages"
              >
                {LANGUAGES.map(({ code, name }) => (
                  <option key={code} value={code}>{name}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <ChevronRight className="h-4 w-4" />
              </div>
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="w-64 flex-shrink-0">
            <div className="mb-2">
              <h3 className="font-semibold text-gray-900">Price Range</h3>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="number"
                value={priceRange[0]}
                onChange={(e) => handlePriceChange('min', e.target.value)}
                min={0}
                max={maxPrice}
                className="w-24 h-10 px-3 border border-gray-300 rounded-md
                  focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                placeholder="Min"
              />
              <span className="text-gray-400">to</span>
              <input
                type="number"
                value={priceRange[1]}
                onChange={(e) => handlePriceChange('max', e.target.value)}
                min={priceRange[0]}
                max={maxPrice}
                className="w-24 h-10 px-3 border border-gray-300 rounded-md
                  focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                placeholder="Max"
              />
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="w-auto flex-1">
            <div className="mb-2">
              <h3 className="font-semibold text-gray-900">Date Range</h3>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="date"
                value={dateRange[0]}
                onChange={(e) => setDateRange([e.target.value, dateRange[1]])}
                className="w-40 h-10 px-3 border border-gray-300 rounded-md
                  focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
              />
              <span className="text-gray-400 flex-shrink-0">to</span>
              <input
                type="date"
                value={dateRange[1]}
                onChange={(e) => setDateRange([dateRange[0], e.target.value])}
                className="w-40 h-10 px-3 border border-gray-300 rounded-md
                  focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Early Bird Filter */}
        {setShowEarlyBirdOnly && (
          <div className="mt-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="early-bird-filter"
                checked={showEarlyBirdOnly}
                onChange={(e) => setShowEarlyBirdOnly(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="early-bird-filter" className="ml-2 block text-sm text-gray-900">
                Show only courses with early bird pricing
              </label>
            </div>
          </div>
        )}

        {/* Categories Filter */}
        <div className="mt-6">
          <div className="mb-2">
            <h3 className="font-semibold text-gray-900">Categories</h3>
          </div>
          <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 -mx-2 px-2">
            {expertises?.map((category: Expertise) => (
              <button
                key={category?._id}
                onClick={() => {
                  if (selectedCategories.includes(category.name)) {
                    setSelectedCategories(selectedCategories.filter(c => c !== category.name));
                  } else {
                    setSelectedCategories([...selectedCategories, category.name]);
                  }
                }}
                className={`
                  flex-none px-3 py-1.5 rounded-full text-sm font-medium
                  transition-colors duration-200
                  ${selectedCategories.includes(category.name)
                    ? 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                {category.name}
              </button>
            ))}
            {expertiseLoader && (
              <div className="flex items-center justify-center py-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}