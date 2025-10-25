import { useForm, SubmitHandler, FieldValues } from "react-hook-form";
import { signIn } from "next-auth/react";
import showToast from "@/utils/showToast";
import { useRouter } from "next/navigation";

interface LoginFormData extends FieldValues {
  email: string;
  password: string;
}

export const useLogin = () => {
  const form = useForm<LoginFormData>({
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const router = useRouter();

  const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
    try {
      const result = await signIn("credentials", {
        redirect: false,
        Email: data.email,
        Password: data.password,
      });
      if (!result?.ok) {
        showToast("Login failed", "error");
        return;
      } else if (result?.ok) {
        showToast("Login successful", "success");
        
        router.push("/");
      }
    } catch (error) {
      console.log(error);
      showToast("Login failed", "error");
    }
  };

  return {
    ...form,
    onSubmit,
  };
};
