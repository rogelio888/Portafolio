export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  branch: string;
  avatarUrl: string;
  phone?: string;
  tenant_id?: string;
  branch_id?: string;
  roles?: string[];
  permissions?: string[];
}
