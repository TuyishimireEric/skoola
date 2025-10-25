import { useSession } from "next-auth/react";

export const useClientSession = () => {
  const { data: session, status } = useSession();
  const organizationId = session?.user.organizations?.[0].OrganizationId ?? "";
  const currentClass = session?.user.organizations?.[0].CurrentClass;
  const userRole = session?.user.organizations?.[0].Role ?? "";
  const userRoleId = session?.user.organizations?.[0].RoleId ?? 0;
  const userId = session?.user.id ?? "";
  const userName = session?.user.name ?? "";
  const userEmail = session?.user.email ?? "";
  const userImage = session?.user.image ?? "";

  return {
    organizationId,
    currentClass,
    userRole,
    userRoleId,
    userId,
    userName,
    userEmail,
    userImage,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
  };
};
