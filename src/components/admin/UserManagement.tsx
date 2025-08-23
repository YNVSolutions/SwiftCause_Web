import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import {
  Plus,
  Search,
  ArrowLeft,
  UserCog,
  Users,
  Shield,
  Activity,
  Download,
  User as UserIcon,
  Loader2,
  AlertCircle,
  Pencil,
  Trash2
} from 'lucide-react';
import { Screen, User, UserRole, AdminSession, Permission, UserPermissions } from '../../App';
import { calculateUserStats } from './utils/userManagementHelpers';
import { useUsers } from '../../hooks/useUsers';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';

interface UserTableRowProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
}

const UserTableRow: React.FC<UserTableRowProps> = ({ user, onEdit, onDelete }) => (
  <TableRow key={user.id}>
    <TableCell>
      <div className="space-y-1">
        <div className="flex items-center space-x-2">
          <UserIcon className="w-4 h-4 text-gray-400" />
          <span className="font-medium">{user.username}</span>
        </div>
        <p className="text-sm text-gray-500">{user.email}</p>
        <p className="text-xs text-gray-400">ID: {user.id}</p>
      </div>
    </TableCell>
    <TableCell>{user.role}</TableCell>
    <TableCell>{user.lastLogin}</TableCell>
    <TableCell>
      {user.permissions && user.permissions.permissions && user.permissions.permissions.length > 0 ? (
        <ul className="list-disc list-inside space-y-1 text-xs">
          {user.permissions.permissions.map((p: string) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      ) : (
        <span className="text-gray-500">No specific permissions</span>
      )}
    </TableCell>
    <TableCell>
      <div className="flex space-x-2">
        <Button variant="ghost" size="sm" onClick={() => onEdit(user)}>
          <Pencil className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onDelete(user.id)}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </TableCell>
  </TableRow>
);

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newUser: any;
  onUserChange: (updates: any) => void;
  onCreateUser: () => void;
  onKioskAccessChange: (kioskId: string, checked: boolean) => void;
}



interface EditUserDialogProps {
  user: User;
  onUpdate: (userId: string, updates: Partial<User>) => void;
  onDelete: (userId: string) => void;
  onClose: () => void;
}

const EditUserDialog: React.FC<EditUserDialogProps> = ({ user, onUpdate, onDelete, onClose }) => {
  const [editedUser, setEditedUser] = useState(user);

  useEffect(() => {
    setEditedUser(user);
  }, [user]);

  const handleUpdate = () => {
    onUpdate(editedUser.id, editedUser);
    onClose();
  };

  const allPermissions: Permission[] = [
    'create_campaign', 'view_campaigns', 'edit_campaign', 'view_dashboard',
    'edit_user', 'manage_permissions', 'assign_campaigns', 'view_donations',
    'create_kiosk', 'edit_kiosk', 'delete_kiosk', 'export_donations',
    'view_users', 'system_admin', 'delete_campaign', 'view_kiosks',
    'create_user', 'edit_user', 'delete_user'
  ];

  const handlePermissionChange = (permission: Permission, checked: boolean) => {
    const newPermissions = checked
      ? [...(editedUser.permissions?.permissions || []), permission]
      : (editedUser.permissions?.permissions || []).filter((p: Permission) => p !== permission);

    setEditedUser(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        permissions: newPermissions
      }
    }));
  };

  return (
    <Dialog open={!!user} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit User: {editedUser.username}</DialogTitle>
          <DialogDescription>
            Update user details, permissions, and status.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={editedUser.username}
              onChange={(e) => setEditedUser({ ...editedUser, username: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={editedUser.email}
              onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              value={editedUser.department || ''}
              onChange={(e) => setEditedUser({ ...editedUser, department: e.target.value })}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isActive"
              checked={editedUser.isActive}
              onCheckedChange={(checked) => setEditedUser({ ...editedUser, isActive: !!checked })}
            />
            <Label htmlFor="isActive">Active</Label>
          </div>
          <div className="space-y-2">
            <Label className="font-bold">Permissions</Label>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {allPermissions.map((permission: Permission) => (
                <div key={permission} className="flex items-center space-x-2">
                  <Checkbox
                    id={permission}
                    checked={editedUser.permissions?.permissions.includes(permission)}
                    onCheckedChange={(checked) => handlePermissionChange(permission, !!checked)}
                  />
                  <Label htmlFor={permission}>{permission}</Label>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter className="flex-col sm:flex-row-reverse">
          <Button onClick={handleUpdate}>Save Changes</Button>
          <Button variant="destructive" onClick={() => { onDelete(editedUser.id); onClose(); }}>
            Delete User
          </Button>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


interface UserManagementProps {
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
  userSession: AdminSession;
  hasPermission: (permission: Permission) => boolean;
}

export function UserManagement({ onNavigate, onLogout, userSession, hasPermission }: UserManagementProps) {
  const { users, loading, error, updateUser, refreshUsers } = useUsers();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [editingUser, setEditingUser] = useState<User | null>(null);


  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    role: 'kiosk' as UserRole,
    kioskAccess: [] as string[]
  });
  const handleCreateUser = () => {

    const userPermissions: UserPermissions = {
      permissions: [],
      role: 'super_admin',
      description: 'Full access to all features'
    };
    const user: User = {
      id: `user-${Date.now()}`,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      lastLogin: undefined,
      permissions: userPermissions,
      isActive: true,
    };
    console.log("Create user functionality not implemented for live data.");
  };
  const handleKioskAccessChange = (kioskId: string, checked: boolean) => {

    if (checked) {
      setNewUser(prev => ({
        ...prev,
        kioskAccess: [...prev.kioskAccess, kioskId]
      }));
    } else {
      setNewUser(prev => ({
        ...prev,
        kioskAccess: prev.kioskAccess.filter(id => id !== kioskId)
      }));
    }
  };
  const handleUserChange = (updates: any) => {
    setNewUser(prev => ({ ...prev, ...updates }));
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      console.log(`Deleting user with ID: ${userId}`);
      refreshUsers();
    }
  };

  const handleUpdateUser = (userId: string, updates: Partial<User>) => {
    updateUser(userId, updates);
  };

  const stats = calculateUserStats(users);

  const exportToCsv = (data: User[]) => {
    if (data.length === 0) {
      alert("No data to export.");
      return;
    }

    const headers = Object.keys(data[0]).join(',');
    const csvContent = data.map(row => Object.values(row).map(value => {
      const stringValue = String(value);
      return `"${stringValue.replace(/"/g, '""')}"`;
    }).join(',')).join('\n');

    const csv = `${headers}\n${csvContent}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `users_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('admin-dashboard')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">User Management</h1>
                <p className="text-sm text-gray-600">Manage platform users and permissions</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportToCsv(users)}
              >
                <Download className="w-4 h-4 mr-2" />
                Export Users
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Administrators</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.admins}</p>
                </div>
                <UserCog className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Kiosk Users</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.kiosks}</p>
                </div>
                <Shield className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.active}</p>
                  <p className="text-xs text-gray-500">Last 7 days</p>
                </div>
                <Activity className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Administrators</SelectItem>
                  <SelectItem value="kiosk">Kiosk Users</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Users ({filteredUsers.length})</CardTitle>
            <CardDescription>Manage user accounts and permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  <p className="ml-4 text-lg text-gray-600">Loading users...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center p-8 text-center text-red-600">
                  <AlertCircle className="h-10 w-10 text-red-500" />
                  <p className="mt-2 text-lg">{error}</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User Details</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead>Access Permissions</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <UserTableRow
                        key={user.id}
                        user={user}
                        onEdit={setEditingUser}
                        onDelete={handleDeleteUser}
                      />
                    ))}
                  </TableBody>
                </Table>
              )}
              {!loading && filteredUsers.length === 0 && (
                <div className="flex items-center justify-center p-8 text-gray-500">
                  No users found.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        {editingUser && (
          <EditUserDialog
            user={editingUser}
            onUpdate={handleUpdateUser}
            onDelete={handleDeleteUser}
            onClose={() => setEditingUser(null)}
          />
        )
        }
      </div>
    </div>
  );
}