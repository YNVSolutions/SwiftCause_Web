import { Organization } from './types';

export const selectOrganizationById = (organizations: Organization[], id: string) =>
  organizations.find(organization => organization.id === id);

export const selectOrganizationsByType = (organizations: Organization[], type: string) =>
  organizations.filter(organization => organization.type === type);

export const selectOrganizationsBySize = (organizations: Organization[], size: string) =>
  organizations.filter(organization => organization.size === size);
