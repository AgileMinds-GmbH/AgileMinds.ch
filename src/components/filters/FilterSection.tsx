import React from 'react';

interface FilterSectionProps {
  title: string;
  icon: React.ReactNode;
  options: string[];
  selected: Set<string>;
  onChange: (value: string) => void;
}

export default function FilterSection({
  title,
  icon,
  options,
  selected,
  onChange,
}: FilterSectionProps) {
  return (
    <div className="min-w-[200px]">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h3 className="font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="space-y-2">
        {options.map((option) => (
          <label
            key={option}
            className="flex items-center gap-2 group cursor-pointer"
          >
            <div className="relative flex items-center">
              <input
                type="checkbox"
                checked={selected.has(option)}
                onChange={() => onChange(option)}
                className="
                  w-4 h-4 border border-gray-300 rounded
                  text-indigo-600 focus:ring-indigo-500
                  transition-colors duration-200
                "
              />
            </div>
            <span className="text-sm text-gray-600 group-hover:text-gray-900">
              {option}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}