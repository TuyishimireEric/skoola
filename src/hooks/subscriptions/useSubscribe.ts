import showToast from "@/utils/showToast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FC_Subscribe } from "./services";

export function useSubscribe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: FC_Subscribe,
    onSuccess: () => {
      showToast("Subscribed successful", "success");
      queryClient.invalidateQueries({ queryKey: ["subscribe"] });
    },
    onError: (error) => {
      console.error("Error creating organization:", error);
      showToast("Failed to record subscription", "error");
    },
  });
}
