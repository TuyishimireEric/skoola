import { useState, useRef, useEffect } from "react";
import clsx from "clsx";
import { IoChevronDown, IoChevronUp } from "react-icons/io5";

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[] | string[];
  icon?: React.ReactNode;
  errorMessage?: string;
  valid?: boolean;
  placeholder?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
}

export const Select = ({
  label,
  value,
  onChange,
  options,
  icon,
  errorMessage,
  valid = true,
  placeholder = "Select an option",
  className,
  required = false,
  disabled = false,
}: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  // Format options to have consistent value/label structure
  const formattedOptions = options.map((option) =>
    typeof option === "string" ? { value: option, label: option } : option
  );

  // Find selected option label for display
  const selectedOption = formattedOptions.find(
    (option) => option.value === value
  );
  const displayValue = selectedOption ? selectedOption.label : placeholder;

  const handleSelectOption = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="w-full relative" ref={selectRef}>
      <label
        htmlFor={label}
        className="text-base font-comic text-primary-600 mb-2 font-semibold flex items-center"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative transition-all duration-300">
        <div
          className={clsx(
            "w-full p-2 bg-white border border-primary-50 rounded-[12px] text-lg font-comic focus:outline-none pl-14 shadow-md transition-all duration-300 cursor-pointer flex items-center justify-between",
            "focus:border-primary-500 ring-4 focus:ring-primary-200 ring-opacity-50",
            isOpen
              ? "border-primary-500 ring-4 ring-primary-200 ring-opacity-50"
              : "",
            valid ? "bg-primary-50" : "bg-white border-red-500",
            disabled ? "opacity-60 cursor-not-allowed" : "",
            className
          )}
          onClick={toggleDropdown}
        >
          <span className={clsx(value ? "text-gray-800" : "text-gray-400")}>
            {displayValue}
          </span>
          <span className="mr-2">
            {isOpen ? <IoChevronUp size={20} /> : <IoChevronDown size={20} />}
          </span>
        </div>

        {icon && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl transition-all duration-300">
            {icon}
          </span>
        )}

        {isOpen && (
          <>
            {/* Overlay to capture clicks */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown menu */}
            <div
              className="absolute w-full mt-1 px-2 bg-white border border-primary-100 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto animate__animated animate__fadeIn"
              style={{ zIndex: 999 }}
            >
              {formattedOptions.length > 0 ? (
                formattedOptions.map((option) => (
                  <div
                    key={option.value}
                    className={clsx(
                      "p-3 hover:bg-primary-100 cursor-pointer font-comic transition-all",
                      option.value === value
                        ? "bg-primary-100 text-primary-700"
                        : "text-gray-700"
                    )}
                    onClick={() => handleSelectOption(option.value)}
                  >
                    {option.label}
                  </div>
                ))
              ) : (
                <div className="p-3 text-gray-500 font-comic text-center">
                  No options available
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {!valid && value && errorMessage && (
        <p className="text-red-500 text-sm mt-1 font-comic">{errorMessage}</p>
      )}
    </div>
  );
};
