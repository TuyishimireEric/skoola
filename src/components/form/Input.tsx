import { FaCircleCheck } from "react-icons/fa6";
import clsx from "clsx";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  valid?: boolean;
  errorMessage?: string;
  icon?: React.ReactNode;
  showValidIcon?: boolean;
}

export const Input = ({
  label,
  value,
  onChange,
  icon,
  valid,
  errorMessage,
  className,
  showValidIcon = true,
  ...props
}: InputProps) => {
  return (
    <div className="w-full">
      <label
        htmlFor={label}
        className="text-sm font-comic text-primary-600 mb-1 font-medium flex items-center"
      >
        {label}
      </label>
      <div className="relative transition-all duration-300">
        <input
          id={label}
          value={value}
          onChange={onChange}
          className={clsx(
            "w-full text-sm pl-12 pr-4 py-2 border-2 border-primary-300 rounded-2xl bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all font-comic",
            className
          )}
          {...props}
        />
        {icon && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl transition-all duration-300">
            {icon}
          </span>
        )}
        {valid && showValidIcon && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-green-400 animate__animated animate__fadeIn">
            <FaCircleCheck size={16} />
          </span>
        )}
      </div>
      {!valid && value && errorMessage && (
        <p className="text-red-500 text-xs mt-1">{errorMessage}</p>
      )}
    </div>
  );
};
