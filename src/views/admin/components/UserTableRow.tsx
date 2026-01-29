import React from 'react';
import { Button } from '../../../shared/ui/button';
import { Badge } from '../../../shared/ui/badge';
import { TableCell, TableRow } from '../../../shared/ui/table';
import { Edit, Trash2, Users, MoreVertical } from 'lucide-react';
import { User } from '../../../shared/types';
import { formatDate, getRoleBadge, getLastLoginStatus } from '../../../shared/lib/userManagementHelpers';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../shared/ui/dropdown-menu';

interface UserTableRowProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
}

export function UserTableRow({ user, onEdit, onDelete }: UserTableRowProps) {
  const lastLoginStatus = getLastLoginStatus(user.lastLogin);
  const roleBadge = getRoleBadge(user.role);
  const IconComponent = lastLoginStatus.icon;

  return (
    <TableRow>
      <TableCell>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="font-medium">{user.username}</span>
          </div>
          <p className="text-sm text-gray-500">{user.email}</p>
          <p className="text-xs text-gray-400">ID: {user.id}</p>
        </div>
      </TableCell>

      <TableCell>
        <Badge className={roleBadge.className}>
          {roleBadge.icon && <roleBadge.icon className="w-3 h-3 mr-1" />}
          {roleBadge.text}
        </Badge>
      </TableCell>

      <TableCell>
        <div className="flex items-center space-x-2">
          <IconComponent className="w-4 h-4 text-gray-400" />
          <div>
            <p className={`text-sm ${lastLoginStatus.className}`}>
              {lastLoginStatus.text}
            </p>
            {user.lastLogin && (
              <p className="text-xs text-gray-500">
                {formatDate(user.lastLogin)}
              </p>
            )}
          </div>
        </div>
      </TableCell>

      

      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(user)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDelete(user.id)}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}