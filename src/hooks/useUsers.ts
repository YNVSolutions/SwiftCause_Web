import { useState, useEffect, useCallback } from 'react';
import { fetchAllUsers, updateUser as updateUserApi, createUser as createUserApi, deleteUser as deleteUserApi } from '../api/userApi';
import { User, UserRole, Permission } from '../App';


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
      const formattedUsers = usersData.map((user: any) => ({
        ...user,
        createdAt: user.createdAt?.toDate ? user.createdAt.toDate().toLocaleDateString() : 'N/A',
        lastLogin: user.lastLogin?.toDate ? user.lastLogin.toDate().toLocaleString() : 'N/A',
        permissions: Array.isArray(user.permissions) ? user.permissions : [],
      })) as User[];
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
