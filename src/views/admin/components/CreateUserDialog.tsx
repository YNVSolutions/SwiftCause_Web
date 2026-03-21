import React from 'react';
import { Button } from '../../../shared/ui/button';
import { Input } from '../../../shared/ui/input';
import { Label } from '../../../shared/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../../shared/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/ui/select';
import { Checkbox } from '../../../shared/ui/checkbox';
import { UserRole } from '../../../shared/types';


interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newUser: {
    username: string;
    email: string;
    role: UserRole;
    kioskAccess: string[];
  };
  onUserChange: (updates: Partial<{
    username: string;
    email: string;
    role: UserRole;
    kioskAccess: string[];
  }>) => void;
  onCreateUser: () => void;
  onKioskAccessChange: (kioskId: string, checked: boolean) => void;
}

export function CreateUserDialog({
  open,
  onOpenChange,
  newUser,
  onUserChange,
  onCreateUser,
  onKioskAccessChange
}: CreateUserDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
          <DialogDescription>
            Add a new user to the platform with appropriate permissions.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={newUser.username}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUserChange({ username: e.target.value })}
                placeholder="Enter username"
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUserChange({ email: e.target.value })}
                placeholder="Enter email address"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="role">Role</Label>
            <Select 
              value={newUser.role} 
              onValueChange={(value: UserRole) => onUserChange({ role: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select user role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrator</SelectItem>
                <SelectItem value="kiosk">Kiosk Operator</SelectItem>
              </SelectContent>
            </Select>
          </div>


        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={onCreateUser}
            disabled={!newUser.username || !newUser.email}
          >
            Create User
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}