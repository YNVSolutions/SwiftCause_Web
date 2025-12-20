import { User, Permission } from './types';

export const selectUserById = (users: User[], id: string) =>
  users.find(user => user.id === id);

export const selectUsersByRole = (users: User[], role: string) =>
  users.filter(user => user.role === role);

export const selectActiveUsers = (users: User[]) =>
  users.filter(user => user.isActive);

export const selectUsersByOrganization = (users: User[], organizationId: string) =>
  users.filter(user => user.organizationId === organizationId);

export const selectUserHasPermission = (user: User, permission: Permission) =>
  user.permissions.includes(permission) || user.permissions.includes('system_admin');
