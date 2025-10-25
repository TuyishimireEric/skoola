import React, { useState, ChangeEvent } from "react";

interface NatureKidsInputProps {
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  ariaLabel?: string;
}

const NatureKidsInput: React.FC<NatureKidsInputProps> = ({
  value,
  onChange,
  placeholder = "Type your answer",
  ariaLabel = "Answer input",
}) => {
  const [isFocused, setIsFocused] = useState<boolean>(false);

  return (
    <div className="w-full mx-auto relative group">
      {/* Leaf background elements */}
      <div className="absolute -top-4 -left-4 w-20 h-20 bg-green-200 rounded-full opacity-50 blur-xl transform group-hover:rotate-45 transition-all duration-500"></div>
      <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-green-200 rounded-full opacity-50 blur-xl transform group-hover:rotate-45 transition-all duration-500"></div>

      <div className="relative z-10">
        {/* Left side nature element */}
        <div className="absolute -left-12 top-1/2 transform -translate-y-1/2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 100 100"
            className={`
              w-14 h-14 
              transition-transform 
              duration-300 
              ${isFocused ? "rotate-12 scale-110" : "hover:rotate-6"}
            `}
          >
            <path
              d="M50 10 C30 40, 20 70, 50 90 C80 70, 70 40, 50 10"
              fill="#4ADE80"
              stroke="#16A34A"
              strokeWidth="3"
            />
            <circle
              cx="50"
              cy="50"
              r="10"
              fill="#DCFCE7"
              stroke="#16A34A"
              strokeWidth="2"
            />
          </svg>
        </div>

        <input
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          aria-label={ariaLabel}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="
            w-full 
            p-4 
            text-2xl
            font-comic
            text-green-900 
            bg-green-50 
            border-2 
            border-green-300 
            rounded-2xl 
            focus:outline-none 
            focus:ring-2 
            focus:ring-emerald-400
            focus:border-transparent
            transition-all 
            duration-300 
            ease-in-out 
            placeholder-green-300
            shadow-md
            hover:shadow-lg
          "
        />

        {/* Right side nature element */}
        <div className="absolute -right-12 top-1/2 transform -translate-y-1/2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 100 100"
            className={`
              w-14 h-14 
              transition-transform 
              duration-300 
              ${isFocused ? "-rotate-12 scale-110" : "hover:-rotate-6"}
            `}
          >
            <path
              d="M30 50 Q50 20, 70 50 T110 50"
              fill="none"
              stroke="#10B981"
              strokeWidth="4"
            />
            <circle
              cx="50"
              cy="70"
              r="15"
              fill="#6EE7B7"
              stroke="#10B981"
              strokeWidth="3"
            />
            <polygon points="50 55, 40 70, 60 70" fill="#FFFFFF" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default NatureKidsInput;
