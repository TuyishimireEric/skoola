import { FaSearch } from "react-icons/fa";

interface InputElementProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
  type?: string;
  limit?: number;
  maxLength?: number;
  max?: string | number;
  min?: string | number;
  currency?: string;
}

export const InputElement = ({
  label,
  value,
  onChange,
  placeholder,
  disabled = false,
  type = "text",
  limit = 30,
  max,
  min,
  currency,
}: InputElementProps) => {
  return (
    <div className="flex flex-col w-full mt-2">
      <label className="text-xs font-bold text-primary-500 pl-2">
        {label}
      </label>
      <div
        className={`relative w-full h-10 border border-primary-400 rounded-full overflow-hidden ${
          disabled ? "bg-gray-50 cursor-not-allowed" : "bg-white/60"
        }`}
      >
        <input
          disabled={disabled}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`block text-black text-sm font-bold w-full px-4 py-2 bg-transparent outline-none active:outline-none focus:outline-none focus:ring-2 focus:ring-primary ${
            disabled ? "cursor-not-allowed" : ""
          }`}
          placeholder={placeholder}
          maxLength={limit}
          max={max}
          min={min}
        />
        {type === "search" && (
          <div className="h-full w-12 flex items-center justify-center absolute right-0 top-0 bottom-0 px-2">
            <FaSearch className="h-4 w-4 opacity-50 " />
          </div>
        )}
        {currency && (
          <div className="h-max my-auto py-1 w-12 flex items-center bg-gray-100 justify-center absolute right-0 top-0 bottom-0 px-2">
            <span className="text-sm font-light">{currency}</span>
          </div>
        )}
      </div>
    </div>
  );
};
