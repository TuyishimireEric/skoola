import axios from "axios";

export const FC_getRoleAccess = async (roleId: string) => {
  if (!roleId) {
    return null;
  }
  const response = await axios.get("/api/auth/roles/access", {
    headers: { "Content-Type": "application/json" },
    params: { roleId },
  });
  return response.data;
};
