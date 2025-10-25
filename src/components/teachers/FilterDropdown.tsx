import { ChevronDown, LucideIcon } from "lucide-react";
import { useState } from "react";

interface FilterDropdownProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  icon?: LucideIcon;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  value,
  options,
  onChange,
  icon: Icon,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative font-comic z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between space-x-2 bg-white border-2 border-primary-300 rounded-xl px-3 py-2 hover:bg-primary-50 transition-colors min-w-[140px] w-full sm:w-auto"
      >
        <div className="flex items-center space-x-2">
          {Icon && <Icon className="w-4 h-4 text-primary-600 flex-shrink-0" />}
          <span className="text-sm font-medium text-primary-700 truncate">
            {value}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-primary-600 flex-shrink-0 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-50"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-1 bg-white border-2 border-primary-300 rounded-xl shadow-xl z-20 min-w-[140px] w-full max-h-60 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option}
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-3 hover:bg-primary-50 text-sm font-medium transition-colors first:rounded-t-xl last:rounded-b-xl ${
                  value === option
                    ? "bg-primary-100 text-primary-800"
                    : "text-primary-700"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default FilterDropdown;
