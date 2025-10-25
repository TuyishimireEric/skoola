import React, { useState } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import {
  UseFormReturn,
  SubmitHandler,
  Path,
  FieldValues,
} from "react-hook-form";
import { formFields, getFieldConfig } from "@/utils/FormFields";
import PleaseWait from "../loader/PleaseWait";

type FormType = keyof typeof formFields;

type DynamicFormProps<T extends FieldValues> = {
  formType: FormType;
  useFormHook: UseFormReturn<T> & { onSubmit: SubmitHandler<T> };
};

function DynamicForm<T extends FieldValues>({
  formType,
  useFormHook,
}: DynamicFormProps<T>) {
  const fieldNames = formFields[formType];
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    onSubmit,
  } = useFormHook;
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col items-center gap-[1.5vh] w-full h-fit"
    >
      {fieldNames.map((fieldKey) => {
        const field = getFieldConfig(fieldKey);

        return (
          <div key={fieldKey} className="w-full relative">
            {"icon" in field && (
              <div className="absolute top-1 left-1 h-fit px-3 py-2 opacity-40 hover:opacity-60 hover:scale-x-105 active:scale-95 active:shadow-sm cursor-pointer">
                {field.icon && <field.icon className="w-8 h-8" />}
              </div>
            )}
            <input
              {...register(fieldKey as Path<T>, field.validation)}
              type={
                field.type === "password" && !showPassword ? "password" : "text"
              }
              id={fieldKey}
              placeholder={field.placeholder}
              className="w-full py-[1.2vh] px-14 text-black placeholder-black/50 shadow-lg bg-transparent border-4 font-sans text-lg border-black/70 rounded-full focus:outline-none focus:border-black"
            />

            {field.type === "password" && (
              <button
                className="absolute top-1 right-1 h-fit px-3 py-2 opacity-15 hover:opacity-30 hover:scale-x-105 active:scale-95 active:shadow-sm"
                onClick={(e) => {
                  e.preventDefault();
                  setShowPassword((prev) => !prev);
                }}
              >
                {showPassword ? (
                  <EyeIcon className="w-8 h-8" aria-hidden="true" />
                ) : (
                  <EyeOffIcon className="w-8 h-8" aria-hidden="true" />
                )}
              </button>
            )}
            {errors[fieldKey] && (
              <span className="text-red-500 text-sm mt-1 ml-4">
                {errors[fieldKey]?.message as string}
              </span>
            )}
          </div>
        );
      })}
      <button
        type="submit"
        className="w-full overflow-hidden relative mt-3 py-[1vh] px-6 shadow-lg text-2xl text-black font-comic border-4 font-bold border-black/60 hover:border-black/80 active:scale-95 active:shadow-sm transition-all rounded-full focus:outline-none focus:border-primary"
        disabled={isSubmitting}
      >
        <div className="relative z-10">
          {isSubmitting ? <PleaseWait /> : "Submit"}
        </div>
      </button>
    </form>
  );
}

export default DynamicForm;
