import { useState, useEffect } from 'react';
import { Button } from '../../shared/ui/button';
import { Input } from '../../shared/ui/input';
import { Card, CardContent } from '../../shared/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../shared/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../shared/ui/table';
import {
  Plus, Search, ArrowLeft, UserCog, Users, Shield, Activity,
  Loader2, AlertCircle, Pencil, Trash2, AlertTriangle
} from 'lucide-react';

import { Screen, User, UserRole, AdminSession, Permission } from '../../shared/types';
import { calculateUserStats } from '../../shared/lib/userManagementHelpers';
import { useUsers } from '../../shared/lib/hooks/useUsers';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../shared/ui/dialog';
import { Label } from '../../shared/ui/label';
import { Checkbox } from '../../shared/ui/checkbox';
import { AdminLayout } from './AdminLayout';

const allPermissions: Permission[] = [
    'view_dashboard', 'manage_permissions', 'create_user', 'edit_user', 'delete_user',
    'view_campaigns', 'create_campaign', 'edit_campaign', 'delete_campaign',
    'view_kiosks', 'create_kiosk', 'edit_kiosk', 'delete_kiosk', 'assign_campaigns',
    'view_donations', 'export_donations', 'view_users'
];

interface UserManagementProps {
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
  userSession: AdminSession;
  hasPermission: (permission: Permission) => boolean;
}

export function UserManagement({ onNavigate, onLogout, userSession, hasPermission }: UserManagementProps) {
    const { users, loading, error, updateUser, addUser, deleteUser } = useUsers(userSession.user.organizationId);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [newUser, setNewUser] = useState({
        username: '', email: '', password: '', role: 'viewer' as UserRole, permissions: [] as Permission[],
    });
    
    // Loading states for different actions
    const [isCreatingUser, setIsCreatingUser] = useState(false);
    const [isUpdatingUser, setIsUpdatingUser] = useState(false);
    const [isDeletingUser, setIsDeletingUser] = useState(false);

    const [dialogMessage, setDialogMessage] = useState<string | null>(null);
    const [dialogAction, setDialogAction] = useState<(() => void) | null>(null);
    const [showConfirm, setShowConfirm] = useState(false);
    
    // Delete confirmation dialog state
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);

    const handleCreateUser = async () => {
        if (!newUser.email || !newUser.password || !newUser.username) {
            setDialogMessage("Username, email, and password are required.");
            return;
        }
        
        setIsCreatingUser(true);
        try {
            await addUser({ ...newUser, organizationId: userSession.user.organizationId! });
            setCreateDialogOpen(false);
            setNewUser({ username: '', email: '', password: '', role: 'viewer', permissions: [] });
        } catch (err) {
            setDialogMessage(`Error: ${(err as Error).message}`);
        } finally {
            setIsCreatingUser(false);
        }
    };

    const handleDeleteUser = (user: User) => {
        setUserToDelete(user);
        setIsDeleteDialogOpen(true);
    };

const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    setIsDeletingUser(true);
    try {
        await deleteUser(userToDelete.id);
        setIsDeleteDialogOpen(false);
        setUserToDelete(null);
    } catch (err) {
        setIsDeleteDialogOpen(false);
        setUserToDelete(null);

        setTimeout(() => {
            setDialogMessage(`Error: ${(err as Error).message}`);
        }, 0);
    } finally {
        setIsDeletingUser(false);
    }
};

    const handleUpdateUser = async (userId: string, updates: Partial<User>) => {
        setIsUpdatingUser(true);
        try {
            await updateUser(userId, updates);
            setEditingUser(null);
        } catch (err) {
            console.log("error", err);
            setDialogMessage(`Error: ${(err as Error).message}`);
        } finally {
            setIsUpdatingUser(false);
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.username?.toLowerCase().includes(searchTerm.toLowerCase()) || user.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const stats = calculateUserStats(users);

    return (
        <AdminLayout
            onNavigate={onNavigate}
            onLogout={onLogout}
            userSession={userSession}
            hasPermission={hasPermission}
            activeScreen="admin-users"
        >
        <div className="space-y-6">
            <header className="bg-white shadow-sm border-b rounded-md">
                <div className="px-2 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between h-auto sm:h-16 gap-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => onNavigate('admin')} className="flex items-center space-x-2">
                                <ArrowLeft className="w-4 h-4" /><span className="hidden sm:inline">Back to Dashboard</span><span className="sm:hidden">Back</span>
                            </Button>
                            <div className="h-6 w-px bg-gray-300 hidden sm:block" />
                            <div>
                                <h1 className="text-xl font-semibold text-gray-900">User Management</h1>
                                <p className="text-sm text-gray-600 hidden lg:block">Manage platform users and permissions</p>
                                <p className="text-sm text-gray-600 hidden sm:block lg:hidden">Manage users and permissions</p>
                            </div>
                        </div>
                        {hasPermission('create_user') && (
                            <Button className="bg-indigo-600 text-white hidden sm:inline-flex" onClick={() => setCreateDialogOpen(true)}>
                                <Plus className="w-4 h-4 mr-2" />Add User
                            </Button>
                        )}
                    </div>
                </div>
            </header>

            <main className="px-2 sm:px-6 lg:px-8 py-4 sm:py-8">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-8">
                    <div className="w-full sm:max-w-md">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input placeholder="Search users by name or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 border border-gray-300" />
                        </div>
                    </div>
                    {hasPermission('create_user') && (
                        <Button className="bg-indigo-600 text-white w-full sm:w-auto sm:hidden" onClick={() => setCreateDialogOpen(true)}>
                            <Plus className="w-4 h-4 mr-2" />Add User
                        </Button>
                    )}
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-gray-600">Total Users</p><p className="text-2xl font-semibold text-gray-900">{stats.total}</p></div><Users className="h-8 w-8 text-blue-600" /></div></CardContent></Card>
                    <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-gray-600">Administrators</p><p className="text-2xl font-semibold text-gray-900">{stats.admins}</p></div><UserCog className="h-8 w-8 text-purple-600" /></div></CardContent></Card>
                    <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-gray-600">Kiosk Users</p><p className="text-2xl font-semibold text-gray-900">{stats.kiosks}</p></div><Shield className="h-8 w-8 text-green-600" /></div></CardContent></Card>
                    <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-gray-600">Active Users</p><p className="text-2xl font-semibold text-gray-900">{stats.active}</p></div><Activity className="h-8 w-8 text-orange-600" /></div></CardContent></Card>
                </div>

                <Card className="mb-8">
    <CardContent className="p-5">
        <div className="flex items-center gap-4">
            <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="h-12 min-w-[220px]">
                    <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="operator">Operator</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
            </Select>
        </div>
    </CardContent>
</Card>

                {/* Modern Table Container */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Users ({filteredUsers.length})</h3>
                        <p className="text-sm text-gray-600 mt-1">Manage user accounts and permissions</p>
                    </div>
                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="flex justify-center p-12">
                                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                            </div>
                        ) : error ? (
                            <div className="text-center text-red-600 p-12">
                                <AlertCircle className="mx-auto h-8 w-8 mb-2" />
                                <p>{error}</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50 border-b border-gray-200">
                                        <TableHead className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">User Details</TableHead>
                                        <TableHead className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Role</TableHead>
                                        <TableHead className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</TableHead>
                                        <TableHead className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Permissions</TableHead>
                                        <TableHead className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredUsers.map((user) => (
                                        <TableRow key={user.id} className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
                                            <TableCell className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">{user.username}</div>
                                                <div className="text-sm text-gray-500">{user.email}</div>
                                            </TableCell>
                                            <TableCell className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600/20 capitalize">
                                                    {user.role.replace('_', ' ')}
                                                </span>
                                            </TableCell>
                                            <TableCell className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 ring-1 ring-green-600/20">
                                                    Active
                                                </span>
                                            </TableCell>
                                            <TableCell className="px-6 py-4">
                                                <div className="text-sm text-gray-500 truncate max-w-xs">
                                                    {user.permissions?.length ? `${user.permissions.length} permissions` : 'None'}
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {hasPermission('edit_user') && (
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            onClick={() => setEditingUser(user)}
                                                            className="h-8 w-8 hover:bg-indigo-50 hover:text-indigo-600"
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    {hasPermission('delete_user') && user.id !== userSession.user.id && (
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            onClick={() => handleDeleteUser(user)}
                                                            className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </div>
                </div>
            </main>

            <CreateUserDialog 
                open={createDialogOpen} 
                onOpenChange={setCreateDialogOpen} 
                newUser={newUser} 
                onUserChange={setNewUser} 
                onCreateUser={handleCreateUser}
                isLoading={isCreatingUser}
            />
            {editingUser && (
                <EditUserDialog 
                    user={editingUser} 
                    onUpdate={handleUpdateUser} 
                    onClose={() => setEditingUser(null)}
                    isLoading={isUpdatingUser}
                />
            )}
            
            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="sm:max-w-[400px] p-0 border-0 shadow-2xl color-white z-100">
                    <div className="bg-white rounded-2xl p-8 text-center">
                        {/* Warning Icon */}
                        <div className="flex justify-center mb-6">
                            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                    <AlertTriangle className="w-6 h-6 text-red-500" />
                                </div>
                            </div>
                        </div>
                        
                        {/* Title */}
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">
                            {isDeletingUser ? 'Deleting user...' : 'Delete user'}
                        </h2>
                        
                        {/* Description */}
                        <p className="text-gray-600 mb-8 leading-relaxed">
                            {isDeletingUser ? (
                                'Please wait while we delete the user.'
                            ) : (
                                <>
                                    Are you sure you want to delete this user?<br />
                                    This action cannot be undone.
                                </>
                            )}
                        </p>
                        
                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <Button 
                                variant="outline" 
                                onClick={() => setIsDeleteDialogOpen(false)}
                                disabled={isDeletingUser}
                                className="flex-1 h-11 border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                                Cancel
                            </Button>
                            <Button 
                                onClick={confirmDeleteUser}
                                disabled={isDeletingUser}
                                className="flex-1 h-11 bg-red-500 hover:bg-red-600 text-white border-0 disabled:opacity-50"
                            >
                                {isDeletingUser ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    'Delete'
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
            
            {/* Error Dialog */}
            <Dialog
                open={!!dialogMessage}
                onOpenChange={(open) => {
                    if (!open) {
                        setDialogMessage(null);
                    }
                }}
            >
                <DialogContent 
                    className="sm:max-w-[400px] p-0 border-0 shadow-2xl"
                    onPointerDownOutside={(e) => {
                        e.preventDefault();
                        setDialogMessage(null);
                    }}
                    onEscapeKeyDown={(e) => {
                        e.preventDefault();
                        setDialogMessage(null);
                    }}
                >
                    <div className="bg-white rounded-2xl p-8 text-center">
                        <div className="flex justify-center mb-6">
                            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                    <AlertCircle className="w-6 h-6 text-red-500" />
                                </div>
                            </div>
                        </div>

                        <h2 className="text-xl font-semibold text-gray-900 mb-3">
                            Error
                        </h2>

                        <p className="text-gray-600 mb-8 leading-relaxed">
                            {dialogMessage}
                        </p>

                        <Button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setDialogMessage(null);
                            }}
                            className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                            Close
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>


        </div>
        </AdminLayout>
    );
}

function CreateUserDialog({ open, onOpenChange, newUser, onUserChange, onCreateUser, isLoading }: any) {
    const onPermissionChange = (permission: Permission, checked: boolean) => {
        const currentPermissions = newUser.permissions || [];
        const newPermissions = checked ? [...currentPermissions, permission] : currentPermissions.filter((p: Permission) => p !== permission);
        onUserChange({ ...newUser, permissions: newPermissions });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{isLoading ? 'Creating User...' : 'Create New User'}</DialogTitle>
                    <DialogDescription>Fill in the details to add a new user to your organization.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="username" className="text-right">Username</Label>
                        <div className="col-span-3">
                            <div className="border border-gray-300 rounded-lg focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-100 transition-colors">
                                <Input 
                                    id="username" 
                                    value={newUser.username} 
                                    onChange={(e) => onUserChange({ ...newUser, username: e.target.value })} 
                                    className="w-full h-12 px-3 bg-transparent outline-none border-0 focus-visible:ring-0 focus-visible:border-transparent"
                                    placeholder="Enter username"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">Email</Label>
                        <div className="col-span-3">
                            <div className="border border-gray-300 rounded-lg focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-100 transition-colors">
                                <Input 
                                    id="email" 
                                    type="email" 
                                    value={newUser.email} 
                                    onChange={(e) => onUserChange({ ...newUser, email: e.target.value })} 
                                    className="w-full h-12 px-3 bg-transparent outline-none border-0 focus-visible:ring-0 focus-visible:border-transparent"
                                    placeholder="Enter email address"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="password" className="text-right">Password</Label>
                        <div className="col-span-3">
                            <div className="border border-gray-300 rounded-lg focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-100 transition-colors">
                                <Input 
                                    id="password" 
                                    type="password" 
                                    value={newUser.password} 
                                    onChange={(e) => onUserChange({ ...newUser, password: e.target.value })} 
                                    className="w-full h-12 px-3 bg-transparent outline-none border-0 focus-visible:ring-0 focus-visible:border-transparent"
                                    placeholder="Enter password"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="role" className="text-right">Role</Label>
                        <div className="col-span-3">
                            <div className="border border-gray-300 rounded-lg focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-100 transition-colors">
                                <Select 
                                    value={newUser.role} 
                                    onValueChange={(value: UserRole) => onUserChange({ ...newUser, role: value })}
                                    disabled={isLoading}
                                >
                                    <SelectTrigger className="w-full h-12 px-3 bg-transparent outline-none border-0 focus-visible:ring-0 focus-visible:border-transparent">
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="super_admin">Super Admin</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="manager">Manager</SelectItem>
                                        <SelectItem value="operator">Operator</SelectItem>
                                        <SelectItem value="viewer">Viewer</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <div>
                        <Label className="font-semibold">Permissions</Label>
                        <div className="grid grid-cols-2 gap-2 mt-2 p-4 border border-gray-300 rounded-lg max-h-40 overflow-y-auto">
                            {allPermissions.map((p) => (
                                <div key={p} className="flex items-center space-x-2">
                                    <Checkbox 
                                        id={`create-${p}`} 
                                        checked={newUser.permissions.includes(p)} 
                                        onCheckedChange={(c) => onPermissionChange(p, !!c)}
                                        disabled={isLoading}
                                    />
                                    <Label htmlFor={`create-${p}`} className="text-sm font-normal capitalize">
                                        {p.replace(/_/g, ' ')}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button 
                        variant="outline" 
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={onCreateUser}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            'Create User'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function EditUserDialog({ user, onUpdate, onClose, isLoading }: { user: User, onUpdate: (userId: string, updates: Partial<User>) => void, onClose: () => void, isLoading: boolean }) {
    const [editedUser, setEditedUser] = useState(user);
    useEffect(() => { setEditedUser(user); }, [user]);

    const handlePermissionChange = (permission: Permission, checked: boolean) => {
        const currentPermissions = editedUser.permissions || [];
        const newPermissions = checked ? [...currentPermissions, permission] : currentPermissions.filter((p: Permission) => p !== permission);
        setEditedUser(prev => ({ ...prev, permissions: newPermissions }));
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{isLoading ? 'Updating User...' : `Edit User: ${editedUser.username}`}</DialogTitle>
                    <DialogDescription>Update the user's role and permissions.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="role" className="text-right">Role</Label>
                        <div className="col-span-3">
                            <div className="border border-gray-300 rounded-lg focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-100 transition-colors">
                                <Select 
                                    value={editedUser.role} 
                                    onValueChange={(value: UserRole) => setEditedUser({ ...editedUser, role: value })}
                                    disabled={isLoading}
                                >
                                    <SelectTrigger className="w-full h-12 px-3 bg-transparent outline-none border-0 focus-visible:ring-0 focus-visible:border-transparent">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="super_admin">Super Admin</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="manager">Manager</SelectItem>
                                        <SelectItem value="operator">Operator</SelectItem>
                                        <SelectItem value="viewer">Viewer</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <div>
                        <Label className="font-semibold">Permissions</Label>
                        <div className="grid grid-cols-2 gap-2 mt-2 p-4 border border-gray-300 rounded-lg max-h-60 overflow-y-auto">
                            {allPermissions.map((p) => (
                                <div key={p} className="flex items-center space-x-2">
                                    <Checkbox 
                                        id={`edit-${p}`} 
                                        checked={editedUser.permissions?.includes(p)} 
                                        onCheckedChange={(c) => handlePermissionChange(p, !!c)}
                                        disabled={isLoading}
                                    />
                                    <Label htmlFor={`edit-${p}`} className="text-sm font-normal capitalize">
                                        {p.replace(/_/g, ' ')}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button 
                        type="button"
                        variant="outline" 
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={() => onUpdate(editedUser.id, { role: editedUser.role, permissions: editedUser.permissions })}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            'Save Changes'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );               
}