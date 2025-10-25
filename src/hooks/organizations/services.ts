import {
  CreateOrganizationInput,
  updateOrganizationUserI,
  UserOrgI,
} from "@/types";
import axios from "axios";
import { OrganizationI } from "@/types";

interface IOrgData {
  total: number;
  organizations: OrganizationI[];
}
export interface IgetOrganizations {
  page: number;
  pageSize: number;
  searchText: string;
}
export const FC_getOrganizationUser = async (): Promise<UserOrgI[]> => {
  const response = await axios.get(`/api/organization/user`);
  return response.data.data;
};

export const FC_updateOrganizationUser = async (
  formData: updateOrganizationUserI
) => {
  const response = await axios.patch(`/api/organization/user`, formData);
  return response.data.data;
};

// get organizations
export const getOrganizations = async (
  data: IgetOrganizations
): Promise<IOrgData> => {
  const response = await axios.get(`/api/organization`, { params: data });
  return response.data.data;
};

export const createOrganization = async (data: CreateOrganizationInput) => {
  const response = await axios.post("/api/organization", data);
  return response.data.data;
};
