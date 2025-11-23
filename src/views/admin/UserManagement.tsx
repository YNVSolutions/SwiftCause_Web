import React, { useState, useEffect } from 'react';
import { Button } from '../../shared/ui/button';
import { Input } from '../../shared/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../shared/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../shared/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../shared/ui/table';
import {
  Plus, Search, ArrowLeft, UserCog, Users, Shield, Activity,
  Loader2, AlertCircle, Pencil, Trash2
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
    const [dialogAction, setDialogAction] = useState<(() => void) | null>(null);
    const [showConfirm, setShowConfirm] = useState(false);

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

    const handleDeleteUser = (userToDelete: User) => {
        setDialogMessage(`Are you sure you want to delete the user "${userToDelete.username}"? This action is permanent and cannot be undone.`);
        setDialogAction(() => async () => {
            try {
                await deleteUser(userToDelete.id);
                setDialogMessage(null);
                setShowConfirm(false);
            } catch (err) {
                setDialogMessage(`Error: ${(err as Error).message}`);
                setShowConfirm(false);
            }
        });
        setShowConfirm(true);
    };

    const handleUpdateUser = async (userId: string, updates: Partial<User>) => {
        try {
            await updateUser(userId, updates);
            setEditingUser(null);
        } catch (err) {
            setDialogMessage(`Error: ${(err as Error).message}`);
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.username?.toLowerCase().includes(searchTerm.toLowerCase()) || user.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const stats = calculateUserStats(users);

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 gap-3">
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" size="sm" onClick={() => onNavigate('admin')} className="flex items-center space-x-2">
                                <ArrowLeft className="w-4 h-4" />
                                <span className="hidden sm:inline">Back to Dashboard</span>
                                <span className="sm:hidden">Back</span>
                            </Button>
                            <div className="h-6 w-px bg-gray-300" />
                                <div>
                                    <h1 className="text-xl font-semibold text-gray-900">User Management</h1>
                                    <p className="text-sm text-gray-600 hidden lg:block">Manage platform users and permissions</p>
                                    <p className="text-sm text-gray-600 hidden sm:block lg:hidden">Manage users and permissions</p>
                                </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {hasPermission('create_user') && <Button className="bg-indigo-600 text-white" onClick={() => setCreateDialogOpen(true)}><Plus className="w-4 h-4 mr-2" />Add User</Button>}
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-gray-600">Total Users</p><p className="text-2xl font-semibold text-gray-900">{stats.total}</p></div><Users className="h-8 w-8 text-blue-600" /></div></CardContent></Card>
                    <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-gray-600">Administrators</p><p className="text-2xl font-semibold text-gray-900">{stats.admins}</p></div><UserCog className="h-8 w-8 text-purple-600" /></div></CardContent></Card>
                    <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-gray-600">Kiosk Users</p><p className="text-2xl font-semibold text-gray-900">{stats.kiosks}</p></div><Shield className="h-8 w-8 text-green-600" /></div></CardContent></Card>
                    <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-gray-600">Active Users</p><p className="text-2xl font-semibold text-gray-900">{stats.active}</p></div><Activity className="h-8 w-8 text-orange-600" /></div></CardContent></Card>
                </div>

                <Card className="mb-8">
                    <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1 relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" /><Input placeholder="Search users by name or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" /></div>
                            <Select value={roleFilter} onValueChange={setRoleFilter}>
                                <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Filter by role" /></SelectTrigger>
                                <SelectContent><SelectItem value="all">All Roles</SelectItem><SelectItem value="admin">Admin</SelectItem><SelectItem value="manager">Manager</SelectItem><SelectItem value="operator">Operator</SelectItem><SelectItem value="viewer">Viewer</SelectItem></SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Users ({filteredUsers.length})</CardTitle><CardDescription>Manage user accounts and permissions</CardDescription></CardHeader>
                    <CardContent>
                        {loading ? <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin" /></div> : error ? <div className="text-center text-destructive p-12"><AlertCircle className="mx-auto h-8 w-8 mb-2" /><p>{error}</p></div> : (
                            <Table>
                                <TableHeader><TableRow><TableHead>User Details</TableHead><TableHead>Role</TableHead><TableHead>Permissions</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {filteredUsers.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell><div className="font-medium">{user.username}</div><div className="text-sm text-muted-foreground">{user.email}</div></TableCell>
                                            <TableCell><span className="capitalize">{user.role}</span></TableCell>
                                            <TableCell><div className="text-xs truncate max-w-xs">{user.permissions?.join(', ').replace(/_/g, ' ') || 'None'}</div></TableCell>
                                            <TableCell className="text-right">
                                                {hasPermission('edit_user') && <Button variant="ghost" size="icon" onClick={() => setEditingUser(user)}><Pencil className="h-4 w-4" /></Button>}
                                                {hasPermission('delete_user') && user.id !== userSession.user.id && <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(user)}><Trash2 className="h-4 w-4 text-destructive" /></Button>}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </main>

            <CreateUserDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} newUser={newUser} onUserChange={setNewUser} onCreateUser={handleCreateUser} />
            {editingUser && <EditUserDialog user={editingUser} onUpdate={handleUpdateUser} onClose={() => setEditingUser(null)} />}
            {dialogMessage && (
                <Dialog open={true} onOpenChange={() => setDialogMessage(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{showConfirm ? "Confirm Action" : "Error"}</DialogTitle>
                        </DialogHeader>
                        <DialogDescription>
                            {dialogMessage}
                        </DialogDescription>
                        <DialogFooter>
                            {showConfirm ? (
                                <>
                                    <Button variant="outline" onClick={() => { setDialogMessage(null); setShowConfirm(false); }}>Cancel</Button>
                                    <Button onClick={() => dialogAction && dialogAction()}>Confirm</Button>
                                </>
                            ) : (
                                <Button onClick={() => setDialogMessage(null)}>Close</Button>
                            )}
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}

function CreateUserDialog({ open, onOpenChange, newUser, onUserChange, onCreateUser }: any) {
    const onPermissionChange = (permission: Permission, checked: boolean) => {
        const currentPermissions = newUser.permissions || [];
        const newPermissions = checked ? [...currentPermissions, permission] : currentPermissions.filter((p: Permission) => p !== permission);
        onUserChange({ ...newUser, permissions: newPermissions });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader><DialogTitle>Create New User</DialogTitle><DialogDescription>Fill in the details to add a new user to your organization.</DialogDescription></DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="username" className="text-right">Username</Label><Input id="username" value={newUser.username} onChange={(e) => onUserChange({ ...newUser, username: e.target.value })} className="col-span-3" /></div>
                    <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="email" className="text-right">Email</Label><Input id="email" type="email" value={newUser.email} onChange={(e) => onUserChange({ ...newUser, email: e.target.value })} className="col-span-3" /></div>
                    <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="password" className="text-right">Password</Label><Input id="password" type="password" value={newUser.password} onChange={(e) => onUserChange({ ...newUser, password: e.target.value })} className="col-span-3" /></div>
                    <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="role" className="text-right">Role</Label><Select value={newUser.role} onValueChange={(value: UserRole) => onUserChange({ ...newUser, role: value })}><SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="super_admin">Super Admin</SelectItem><SelectItem value="admin">Admin</SelectItem><SelectItem value="manager">Manager</SelectItem><SelectItem value="operator">Operator</SelectItem><SelectItem value="viewer">Viewer</SelectItem></SelectContent></Select></div>
                    <div><Label className="font-semibold">Permissions</Label><div className="grid grid-cols-2 gap-2 mt-2 p-4 border rounded-md max-h-40 overflow-y-auto">{allPermissions.map((p) => (<div key={p} className="flex items-center space-x-2"><Checkbox id={`create-${p}`} checked={newUser.permissions.includes(p)} onCheckedChange={(c) => onPermissionChange(p, !!c)} /><Label htmlFor={`create-${p}`} className="text-sm font-normal capitalize">{p.replace(/_/g, ' ')}</Label></div>))}</div></div>
                </div>
                <DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button onClick={onCreateUser}>Create User</Button></DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function EditUserDialog({ user, onUpdate, onClose }: { user: User, onUpdate: (userId: string, updates: Partial<User>) => void, onClose: () => void }) {
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
                <DialogHeader><DialogTitle>Edit User: {editedUser.username}</DialogTitle><DialogDescription>Update the user's role and permissions.</DialogDescription></DialogHeader>
                <div className="grid gap-6 py-4">
                    <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="role" className="text-right">Role</Label><Select value={editedUser.role} onValueChange={(value: UserRole) => setEditedUser({ ...editedUser, role: value })}><SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="super_admin">Super Admin</SelectItem><SelectItem value="admin">Admin</SelectItem><SelectItem value="manager">Manager</SelectItem><SelectItem value="operator">Operator</SelectItem><SelectItem value="viewer">Viewer</SelectItem></SelectContent></Select></div>
                    <div><Label className="font-semibold">Permissions</Label><div className="grid grid-cols-2 gap-2 mt-2 p-4 border rounded-md max-h-60 overflow-y-auto">{allPermissions.map((p) => (<div key={p} className="flex items-center space-x-2"><Checkbox id={`edit-${p}`} checked={editedUser.permissions?.includes(p)} onCheckedChange={(c) => handlePermissionChange(p, !!c)} /><Label htmlFor={`edit-${p}`} className="text-sm font-normal capitalize">{p.replace(/_/g, ' ')}</Label></div>))}</div></div>
                </div>

                <DialogFooter><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={() => onUpdate(editedUser.id, { role: editedUser.role, permissions: editedUser.permissions })}>Save Changes</Button></DialogFooter>
            </DialogContent>
        </Dialog>
    );               
}