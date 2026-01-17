import { useState, useEffect, useCallback } from 'react';
import { fetchAllUsers, updateUser as updateUserApi, createUser as createUserApi, deleteUser as deleteUserApi } from '../../api/userApi';
import { User, UserRole, Permission } from '../../types';


export function useUsers(organizationId?: string) {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  const refreshUsers = useCallback(async () => {
    if (!organizationId) {
      setUsers([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const usersData = await fetchAllUsers(organizationId);
      const formattedUsers = usersData.map((user) => {
        const record = user as Record<string, unknown>;
        const createdAt = record.createdAt;
        const lastLogin = record.lastLogin;
        const formattedCreatedAt =
          typeof createdAt === 'object' &&
          createdAt !== null &&
          'toDate' in createdAt &&
          typeof (createdAt as { toDate?: unknown }).toDate === 'function'
            ? (createdAt as { toDate: () => Date }).toDate().toLocaleDateString()
            : 'N/A';
        const formattedLastLogin =
          typeof lastLogin === 'object' &&
          lastLogin !== null &&
          'toDate' in lastLogin &&
          typeof (lastLogin as { toDate?: unknown }).toDate === 'function'
            ? (lastLogin as { toDate: () => Date }).toDate().toLocaleString()
            : 'N/A';

        return {
          ...(record as User),
          createdAt: formattedCreatedAt,
          lastLogin: formattedLastLogin,
          permissions: Array.isArray(record.permissions) ? record.permissions as Permission[] : [],
        };
      });
      setUsers(formattedUsers);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    refreshUsers();
  }, [refreshUsers]);

  const addUser = useCallback(async (userData: {
    email: string;
    password?: string;
    username: string;
    role: UserRole;
    permissions: Permission[];
    organizationId: string;
  }) => {
    try {
      await createUserApi(userData);
      await refreshUsers();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }, [refreshUsers]);

  const deleteUser = useCallback(async (userId: string) => {
    try {
      setUsers(prev => prev.filter(user => user.id !== userId));
      await deleteUserApi(userId);
    } catch (error) {
      console.error(error);
      refreshUsers();
      throw error;
    }
  }, [refreshUsers]);

  const updateUser = useCallback(async (userId: string, userData: Partial<User>) => {
    try {
      setUsers(prev => prev.map(user => (user.id === userId ? { ...user, ...userData } : user)));
      await updateUserApi(userId, userData);
    } catch (error) {
      console.error(error);
      refreshUsers();
      throw new Error("Failed to update user.");
    }
  }, [refreshUsers]);

  return { loading, error, users, refreshUsers, updateUser, addUser, deleteUser };
}
