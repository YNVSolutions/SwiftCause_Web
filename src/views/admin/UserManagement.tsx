import React, { useState, useEffect } from 'react';
import { Button } from '../../shared/ui/button';
import { Input } from '../../shared/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../shared/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../shared/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../shared/ui/table';
import {
  Plus, Search, UserCog, Users, Shield, Activity,
  Loader2, AlertCircle, Pencil, Trash2, AlertTriangle, MoreVertical
} from 'lucide-react';
import { Skeleton } from "../../shared/ui/skeleton";
import { Ghost } from "lucide-react";
import { Screen, User, UserRole, AdminSession, Permission } from '../../shared/types';
import { calculateUserStats } from '../../shared/lib/userManagementHelpers';
import { useUsers } from '../../shared/lib/hooks/useUsers';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../shared/ui/dialog';
import { Label } from '../../shared/ui/label';
import { Checkbox } from '../../shared/ui/checkbox';
import { DialogPortal } from '@radix-ui/react-dialog';
import { AdminLayout } from './AdminLayout';
import { AdminSearchFilterHeader, AdminSearchFilterConfig } from './components/AdminSearchFilterHeader';
import { SortableTableHeader } from './components/SortableTableHeader';
import { useTableSort } from '../../shared/lib/hooks/useTableSort';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../shared/ui/dropdown-menu";

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
    

    const [dialogMessage, setDialogMessage] = useState<string | null>(null);
    
    // Delete confirmation dialog state
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);

    const handleCreateUser = async () => {
        if (!newUser.email || !newUser.password || !newUser.username) {
            setDialogMessage("Username, email, and password are required.");
            return;
        }
        try {
            await addUser({ ...newUser, organizationId: userSession.user.organizationId! });
            setCreateDialogOpen(false);
            setNewUser({ username: '', email: '', password: '', role: 'viewer', permissions: [] });
        } catch (err) {
            setDialogMessage(`Error: ${(err as Error).message}`);
        }
    };

    const handleDeleteUser = (user: User) => {
        setUserToDelete(user);
        setIsDeleteDialogOpen(true);
    };

    const confirmDeleteUser = async () => {
        if (!userToDelete) return;
        
        try {
            await deleteUser(userToDelete.id);
            setIsDeleteDialogOpen(false);
            setUserToDelete(null);
        } catch (err) {
            setDialogMessage(`Error: ${(err as Error).message}`);
            setIsDeleteDialogOpen(false);
            setUserToDelete(null);
        }
    };

    const handleUpdateUser = async (userId: string, updates: Partial<User>) => {
        try {
            await updateUser(userId, updates);
            setEditingUser(null);
        } catch (err) {
            const errorMessage = (err as Error).message || "Failed to update user.";
            console.error('Update user error:', err);
            setDialogMessage(`Error: ${errorMessage}`);
        }
    };

    // Filter users first
    const filteredUsersData = users.filter(user => {
        const matchesSearch = !searchTerm || 
            user.username?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        // Hide super_admin users from non-super-admin users
        const canViewSuperAdmin = userSession.user.role === 'super_admin' || user.role !== 'super_admin';
        return matchesSearch && matchesRole && canViewSuperAdmin;
    });

    // Use sorting hook
    const { sortedData: filteredUsers, sortKey, sortDirection, handleSort } = useTableSort({
        data: filteredUsersData
    });

    const stats = calculateUserStats(users);

    // Configuration for AdminSearchFilterHeader
    const searchFilterConfig: AdminSearchFilterConfig = {
        searchPlaceholder: "Search users...",
        filters: [
            {
                key: "roleFilter",
                label: "Role",
                type: "select",
                options: [
                    { label: "Admin", value: "admin" },
                    { label: "Manager", value: "manager" },
                    { label: "Operator", value: "operator" },
                    { label: "Viewer", value: "viewer" }
                ]
            }
        ]
    };

    const filterValues = {
        roleFilter
    };

    const handleFilterChange = (key: string, value: any) => {
        if (key === "roleFilter") {
            setRoleFilter(value);
        }
    };

    return (
        <AdminLayout
            onNavigate={onNavigate}
            onLogout={onLogout}
            userSession={userSession}
            hasPermission={hasPermission}
            activeScreen="admin-users"
            hideSidebarTrigger
        >
        <div className="space-y-4 sm:space-y-6">
            <main className="px-2 sm:px-4 lg:px-8 pb-4 sm:pb-8">
                {/* Stat Cards Section */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
                    <Card><CardContent className="p-3 sm:p-4 lg:p-6"><div className="flex items-center justify-between"><div><p className="text-xs sm:text-sm font-medium text-gray-600">Total Users</p><p className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900">{stats.total}</p></div><Users className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-blue-600" /></div></CardContent></Card>
                    <Card><CardContent className="p-3 sm:p-4 lg:p-6"><div className="flex items-center justify-between"><div><p className="text-xs sm:text-sm font-medium text-gray-600">Administrators</p><p className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900">{stats.admins}</p></div><UserCog className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-purple-600" /></div></CardContent></Card>
                    <Card><CardContent className="p-3 sm:p-4 lg:p-6"><div className="flex items-center justify-between"><div><p className="text-xs sm:text-sm font-medium text-gray-600">Kiosk Users</p><p className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900">{stats.kiosks}</p></div><Shield className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-green-600" /></div></CardContent></Card>
                    <Card><CardContent className="p-3 sm:p-4 lg:p-6"><div className="flex items-center justify-between"><div><p className="text-xs sm:text-sm font-medium text-gray-600">Active Users</p><p className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900">{stats.active}</p></div><Activity className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-orange-600" /></div></CardContent></Card>
                </div>

                {/* Unified Header Component */}
                <AdminSearchFilterHeader
                    title={`Users (${filteredUsers.length})`}
                    subtitle="Manage platform users and permissions"
                    config={searchFilterConfig}
                    searchValue={searchTerm}
                    onSearchChange={setSearchTerm}
                    filterValues={filterValues}
                    onFilterChange={handleFilterChange}
                    actions={
                        hasPermission('create_user') ? (
                            <Button
                                className="bg-indigo-600 text-white"
                                onClick={() => setCreateDialogOpen(true)}
                            >
                                <Plus className="w-4 h-4 mr-2" />Add User
                            </Button>
                        ) : undefined
                    }
                />

                {/* Modern Table Container */}
                <Card className="overflow-hidden">
                    <CardContent className="p-0">
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
                        <>
                            <div className="md:hidden px-6 py-6 space-y-4">
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map((user) => (
                                        <div
                                            key={user.id}
                                            className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <div className="text-sm font-semibold text-gray-900">
                                                        {user.username}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {user.email}
                                                    </div>
                                                </div>
                                                {(hasPermission('edit_user') ||
                                                    (hasPermission('delete_user') && user.id !== userSession.user.id)) && (
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-gray-500 hover:bg-gray-100"
                                                                aria-label="User actions"
                                                            >
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            {hasPermission('edit_user') && (
                                                                <DropdownMenuItem
                                                                    onSelect={() => setEditingUser(user)}
                                                                    className="flex items-center gap-2"
                                                                >
                                                                    <Pencil className="h-4 w-4" />
                                                                    Edit
                                                                </DropdownMenuItem>
                                                            )}
                                                            {hasPermission('delete_user') && user.id !== userSession.user.id && (
                                                                <DropdownMenuItem
                                                                    onSelect={() => handleDeleteUser(user)}
                                                                    className="flex items-center gap-2 text-red-600 focus:text-red-600"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                    Delete
                                                                </DropdownMenuItem>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                )}
                                            </div>

                                            <div className="mt-4 flex flex-wrap items-center gap-2">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600/20 capitalize">
                                                    {user.role.replace('_', ' ')}
                                                </span>
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 ring-1 ring-green-600/20">
                                                    Active
                                                </span>
                                            </div>

                                            <div className="mt-4 border-t border-gray-100 pt-4 text-sm">
                                                <div className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                                                    Permissions
                                                </div>
                                                <div className="mt-1 text-sm text-gray-600">
                                                    {user.permissions?.length ? `${user.permissions.length} permissions` : 'None'}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <Ghost className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                                        <p className="text-lg font-medium mb-2">No Users Found</p>
                                        <p className="text-sm mb-4">
                                            No users match your filters.
                                        </p>
                                    </div>
                                )}
                            </div>
                            <div className="hidden md:block overflow-hidden">
                                <Table className="w-full table-fixed">
                                    <TableHeader>
                                        <TableRow className="bg-gray-100 border-b-2 border-gray-300">
                                            <SortableTableHeader 
                                                sortKey="username" 
                                                currentSortKey={sortKey} 
                                                currentSortDirection={sortDirection} 
                                                onSort={handleSort}
                                                className="w-[30%] px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wide"
                                            >
                                                User Details
                                            </SortableTableHeader>
                                            <SortableTableHeader 
                                                sortKey="role" 
                                                currentSortKey={sortKey} 
                                                currentSortDirection={sortDirection} 
                                                onSort={handleSort}
                                                className="w-[15%] px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wide"
                                            >
                                                Role
                                            </SortableTableHeader>
                                            <SortableTableHeader 
                                                sortKey="status" 
                                                currentSortKey={sortKey} 
                                                currentSortDirection={sortDirection} 
                                                onSort={handleSort}
                                                className="w-[12%] px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wide"
                                            >
                                                Status
                                            </SortableTableHeader>
                                            <SortableTableHeader 
                                                sortable={false}
                                                sortKey="permissions" 
                                                currentSortKey={sortKey} 
                                                currentSortDirection={sortDirection} 
                                                onSort={handleSort}
                                                className="w-[28%] px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wide"
                                            >
                                                Permissions
                                            </SortableTableHeader>
                                            <SortableTableHeader 
                                                sortable={false}
                                                sortKey="actions" 
                                                currentSortKey={sortKey} 
                                                currentSortDirection={sortDirection} 
                                                onSort={handleSort}
                                                className="w-[15%] px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wide text-right"
                                            >
                                                Actions
                                            </SortableTableHeader>
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
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
            </main>

            <CreateUserDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} newUser={newUser} onUserChange={setNewUser} onCreateUser={handleCreateUser} userSession={userSession} />
            {editingUser && <EditUserDialog user={editingUser} onUpdate={handleUpdateUser} onClose={() => setEditingUser(null)} userSession={userSession} />}
            
            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="sm:max-w-[400px] p-0 border-0 shadow-2xl">
                    <DialogHeader className="sr-only">
                        <DialogTitle>Delete user</DialogTitle>
                        <DialogDescription>
                            Confirm deletion of the selected user.
                        </DialogDescription>
                    </DialogHeader>
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
                            Delete user
                        </h2>
                        
                        {/* Description */}
                        <p className="text-gray-600 mb-8 leading-relaxed">
                            Are you sure you want to delete this user?<br />
                            This action cannot be undone.
                        </p>
                        
                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <Button 
                                variant="outline" 
                                onClick={() => setIsDeleteDialogOpen(false)}
                                className="flex-1 h-11 border-gray-300 text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </Button>
                            <Button 
                                onClick={confirmDeleteUser}
                                className="flex-1 h-11 bg-red-500 hover:bg-red-600 text-white border-0"
                            >
                                Delete
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
            
            {dialogMessage && (
                <Dialog open={true} onOpenChange={() => setDialogMessage(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Error</DialogTitle>
                        </DialogHeader>
                        <DialogDescription>
                            {dialogMessage}
                        </DialogDescription>
                        <DialogFooter>
                            <Button onClick={() => setDialogMessage(null)}>Close</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
        </AdminLayout>
    );
}

function CreateUserDialog({ open, onOpenChange, newUser, onUserChange, onCreateUser, userSession }: any) {
    const onPermissionChange = (permission: Permission, checked: boolean) => {
        const currentPermissions = newUser.permissions || [];
        const newPermissions = checked ? [...currentPermissions, permission] : currentPermissions.filter((p: Permission) => p !== permission);
        onUserChange({ ...newUser, permissions: newPermissions });
    };

    const isSuperAdmin = userSession?.user?.role === 'super_admin';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader><DialogTitle>Create New User</DialogTitle><DialogDescription>Fill in the details to add a new user to your organization.</DialogDescription></DialogHeader>
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
                                />
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="role" className="text-right">Role</Label>
                        <div className="col-span-3">
                            <div className="border border-gray-300 rounded-lg focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-100 transition-colors">
                                <Select value={newUser.role} onValueChange={(value: UserRole) => onUserChange({ ...newUser, role: value })}>
                                    <SelectTrigger className="w-full h-12 px-3 bg-transparent outline-none border-0 focus-visible:ring-0 focus-visible:border-transparent">
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {isSuperAdmin && <SelectItem value="super_admin">Super Admin</SelectItem>}
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
                                    />
                                    <Label htmlFor={`create-${p}`} className="text-sm font-normal capitalize">
                                        {p.replace(/_/g, ' ')}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button onClick={onCreateUser}>Create User</Button></DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function EditUserDialog({ user, onUpdate, onClose, userSession }: { user: User, onUpdate: (userId: string, updates: Partial<User>) => void, onClose: () => void, userSession: AdminSession }) {
    const [editedUser, setEditedUser] = useState(user);
    useEffect(() => { setEditedUser(user); }, [user]);

    const handlePermissionChange = (permission: Permission, checked: boolean) => {
        const currentPermissions = editedUser.permissions || [];
        const newPermissions = checked ? [...currentPermissions, permission] : currentPermissions.filter((p: Permission) => p !== permission);
        setEditedUser(prev => ({ ...prev, permissions: newPermissions }));
    };

    const isSuperAdmin = userSession?.user?.role === 'super_admin';

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader><DialogTitle>Edit User: {editedUser.username}</DialogTitle><DialogDescription>Update the user's role and permissions.</DialogDescription></DialogHeader>
                <div className="grid gap-6 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="role" className="text-right">Role</Label>
                        <div className="col-span-3">
                            <div className="border border-gray-300 rounded-lg focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-100 transition-colors">
                                <Select value={editedUser.role} onValueChange={(value: UserRole) => setEditedUser({ ...editedUser, role: value })}>
                                    <SelectTrigger className="w-full h-12 px-3 bg-transparent outline-none border-0 focus-visible:ring-0 focus-visible:border-transparent">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {isSuperAdmin && <SelectItem value="super_admin">Super Admin</SelectItem>}
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
                                    />
                                    <Label htmlFor={`edit-${p}`} className="text-sm font-normal capitalize">
                                        {p.replace(/_/g, ' ')}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <DialogFooter><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={() => onUpdate(editedUser.id, { role: editedUser.role, permissions: editedUser.permissions })}>Save Changes</Button></DialogFooter>
            </DialogContent>
        </Dialog>
    );               
}
