import React, { useState, useRef, useEffect } from "react";
import { FaCircleCheck, FaChevronDown } from "react-icons/fa6";
import clsx from "clsx";
import { Search } from "lucide-react";

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  valid?: boolean;
  errorMessage?: string;
  icon?: React.ReactNode;
  showValidIcon?: boolean;
  searchable?: boolean;
  className?: string;
  disabled?: boolean;
}

export const SelectOptions = ({
  label,
  value,
  onChange,
  options,
  placeholder = "Select an option",
  icon,
  valid,
  errorMessage,
  className,
  searchable = true,
  disabled = false
}: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);

  // Filter options based on search term
  const filteredOptions = searchable
    ? options.filter((option) =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  // Get selected option label
  const selectedOption = options.find((option) => option.value === value);
  const displayValue = selectedOption ? selectedOption.label : "";

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          setHighlightedIndex((prev) =>
            prev < filteredOptions.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          event.preventDefault();
          setHighlightedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredOptions.length - 1
          );
          break;
        case "Enter":
          event.preventDefault();
          if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
            handleSelect(filteredOptions[highlightedIndex].value);
          }
          break;
        case "Escape":
          setIsOpen(false);
          setSearchTerm("");
          setHighlightedIndex(-1);
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, highlightedIndex, filteredOptions]);

  // Scroll highlighted option into view
  useEffect(() => {
    if (highlightedIndex >= 0 && optionsRef.current) {
      const highlightedElement = optionsRef.current.children[
        highlightedIndex
      ] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }
  }, [highlightedIndex]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm("");
    setHighlightedIndex(-1);
  };

  const handleToggle = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
    if (!isOpen && searchable) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setHighlightedIndex(-1);
  };

  return (
    <div className="w-full" ref={containerRef}>
      <label
        htmlFor={label}
        className="text-base font-comic text-primary-600 mb-2 font-semibold flex items-center"
      >
        {label}
      </label>

      <div className="relative">
        {/* Main Select Button */}
        <div
          onClick={handleToggle}
          className={clsx(
            "w-full pl-12 pr-12 py-3 border-2 border-primary-300 rounded-2xl bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all font-comic cursor-pointer flex items-center justify-between",
            {
              "ring-2 ring-amber-400": isOpen,
              "opacity-50 cursor-not-allowed": disabled,
            },
            className
          )}
        >
          <span className={clsx("truncate", !displayValue && "text-gray-400")}>
            {displayValue || placeholder}
          </span>
        </div>

        {/* Icon */}
        {icon && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl transition-all duration-300 pointer-events-none">
            {icon}
          </span>
        )}

        {/* Dropdown Arrow */}
        <span
          className={clsx(
            "absolute right-4 top-1/2 -translate-y-1/2 text-primary-600 transition-transform duration-300 pointer-events-none",
            isOpen && "rotate-180"
          )}
        >
          <FaChevronDown size={16} />
        </span>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-primary-300 rounded-2xl shadow-lg z-50 max-h-64 overflow-hidden">
            {/* Search Input */}
            {searchable && (
              <div className="p-3 border-b border-primary-200">
                <div className="relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder="Search..."
                    className="w-full pl-10 pr-4 py-2 border border-primary-300 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all font-comic text-sm"
                  />
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-600"
                    size={14}
                  />
                </div>
              </div>
            )}

            {/* Options List */}
            <div ref={optionsRef} className="max-h-48 overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-3 text-gray-500 font-comic text-sm text-center">
                  No options found
                </div>
              ) : (
                filteredOptions.map((option, index) => (
                  <div
                    key={option.value}
                    onClick={() => handleSelect(option.value)}
                    className={clsx(
                      "px-4 py-3 cursor-pointer font-comic text-sm transition-colors duration-150 flex items-center justify-between",
                      {
                        "bg-amber-50 text-primary-700":
                          index === highlightedIndex,
                        "hover:bg-gray-50": index !== highlightedIndex,
                        "bg-amber-100 text-primary-800 font-semibold":
                          option.value === value,
                      }
                    )}
                  >
                    <span className="truncate">{option.label}</span>
                    {option.value === value && (
                      <FaCircleCheck
                        className="text-green-500 ml-2 flex-shrink-0"
                        size={14}
                      />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {!valid && value && errorMessage && (
        <p className="text-red-500 text-sm mt-1 font-comic">{errorMessage}</p>
      )}
    </div>
  );
};
