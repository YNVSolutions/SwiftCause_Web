import { UserRole, Permission } from '../../../shared/types';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
  isActive: boolean;
  createdAt?: string;
  lastLogin?: string;
  organizationId?: string;
}
