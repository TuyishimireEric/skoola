import showToast from "@/utils/showToast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createOrganization } from "./services";

export function useCreateOrganization({
  setOrgId,
}: {
  setOrgId: (id: string) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOrganization,
    onSuccess: (data) => {
      showToast("School Registered successful", "success");
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
      setOrgId(data.Id)
    },
    onError: (error) => {
      console.error("Error creating organization:", error);
      showToast("Failed to register school", "error");
    },
  });
}
