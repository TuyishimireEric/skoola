export interface RoleI {
  Id?: string;
  Name: string;
  CreatedOn?: string;
  UpdatedOn?: string;
  IsActive: boolean;
}

export interface RoleAccessI  {
  Id?: string;
  RoleId: string;
  Access: string;
  CreatedOn?: string;
  UpdatedOn?: string;
}
