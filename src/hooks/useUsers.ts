import { useState, useEffect, useCallback } from 'react';
import { fetchAllUsers, updateUser as updateUserApi } from '../api/userApi';
import { User } from '../App';

export function useUsers(organizationId?: string) {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  const refreshUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const usersData = await fetchAllUsers(organizationId);
      
      const formattedUsers = usersData.map(user => ({
        ...user,
        lastLogin: user.lastLogin && typeof user.lastLogin.toDate === 'function'
          ? user.lastLogin.toDate().toLocaleString()
          : 'N/A',
        updatedAt: user.updatedAt && typeof user.updatedAt.toDate === 'function'
          ? user.updatedAt.toDate().toLocaleString()
          : 'N/A'
      }));
      setUsers(formattedUsers as unknown as User[]);
    } catch (e) {
      setError('Failed to load users. Please try again.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  const updateUser = useCallback(async (userId: string, userData: Partial<User>) => {
    try {
      setUsers(prevUsers => prevUsers.map(user => 
        user.id === userId ? { ...user, ...userData } : user
      ));

      await updateUserApi(userId, userData);
      
    } catch (e) {
      setError('Failed to update user. Please try again.');
      console.error(e);
      refreshUsers();
    }
  }, [refreshUsers]);

  useEffect(() => {
    refreshUsers();
  }, [refreshUsers, organizationId]);

  return { loading, error, users, refreshUsers, updateUser };
}