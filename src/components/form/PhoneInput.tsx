import "react-phone-number-input/style.css";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import { FaCircleCheck } from "react-icons/fa6";

interface PhoneInputProps {
  label: string;
  value: string;
  setValue: (value: string) => void;
  setIsValid: (value: boolean) => void;
  isValid: boolean;
  placeholder: string;
  disabled?: boolean;
}

export const PhoneInputElement = ({
  label,
  value,
  setValue,
  placeholder,
  isValid,
  setIsValid,
  disabled = false,
}: PhoneInputProps) => {
  return (
    <div className="flex flex-col w-full">
      <label
        htmlFor={label}
        className="text-base font-comic text-primary-600 mb-2 font-semibold flex items-center"
      >
        {label}
      </label>
      <div className="relative transition-all duration-300">
        <PhoneInput
          international
          defaultCountry="RW"
          placeholder={placeholder}
          value={value}
          onChange={(value: string | undefined) => {
            setValue(value || "");
            setIsValid(isValidPhoneNumber(value || ""));
          }}
          disabled={disabled}
          limitMaxLength={true}
          className="w-full pl-4 gap-1 pr-4 py-4 border-2 border-primary-300 rounded-2xl bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all font-comic"
        />
        {isValid && value && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-green-400 animate__animated animate__fadeIn">
            <FaCircleCheck size={16} />
          </span>
        )}
      </div>
      {!isValid && value && (
        <p className="text-red-500 text-sm mt-1">
          Please provide valid phone number
        </p>
      )}
    </div>
  );
};

export default PhoneInputElement;

{
  /* <div className="w-full">
      <label
        htmlFor={label}
        className="text-base font-comic text-primary-600 mb-2 font-semibold flex items-center"
      >
        {label}
      </label>
      <div className="relative transition-all duration-300">
        <input
          id={label}
          value={value}
          onChange={onChange}
          className={clsx(
            "w-full pl-12 pr-4 py-3 border-2 border-primary-300 rounded-2xl bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all font-comic",
            className
          )}
          {...props}
        />
        {icon && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl transition-all duration-300">
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
        <p className="text-red-500 text-sm mt-1">{errorMessage}</p>
      )}
    </div> */
}
