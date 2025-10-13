import { UserRole, User } from '../../../app/App';
import { UserCog, Settings, CheckCircle, AlertCircle, Clock } from 'lucide-react';

export const formatDate = (dateString: string | undefined) => {
  if (!dateString) return 'Never';
  return new Date(dateString).toLocaleString();
};

export const getRoleBadge = (role: UserRole) => {
  switch (role) {
    case 'admin':
      return { 
        className: "bg-purple-100 text-purple-800 border-purple-200",
        icon: UserCog,
        text: "Admin"
      };
    case 'kiosk':
      return {
        className: "bg-blue-100 text-blue-800 border-blue-200", 
        icon: Settings,
        text: "Kiosk"
      };
    default:
      return {
        className: "",
        icon: null,
        text: role
      };
  }
};

export const getLastLoginStatus = (lastLogin: string | undefined) => {
  if (!lastLogin) {
    return {
      icon: AlertCircle,
      text: "Never logged in",
      className: "text-gray-500"
    };
  }

  const lastLoginDate = new Date(lastLogin);
  const now = new Date();
  const daysDiff = Math.floor((now.getTime() - lastLoginDate.getTime()) / (1000 * 3600 * 24));

  if (daysDiff === 0) {
    return {
      icon: CheckCircle,
      text: "Active today",
      className: "text-green-600"
    };
  } else if (daysDiff <= 7) {
    return {
      icon: Clock,
      text: `${daysDiff} day${daysDiff > 1 ? 's' : ''} ago`,
      className: "text-yellow-600"
    };
  } else {
    return {
      icon: AlertCircle,
      text: `${daysDiff} days ago`,
      className: "text-red-600"
    };
  }
};

export const calculateUserStats = (users: User[]) => {
  const adminUsers = users.filter(u => u.role === 'admin').length;
  const kioskUsers = users.filter(u => u.role === 'kiosk').length;
  const activeUsers = users.filter(u => {
    if (!u.lastLogin) return false;
    const daysDiff = Math.floor((new Date().getTime() - new Date(u.lastLogin).getTime()) / (1000 * 3600 * 24));
    return daysDiff <= 7;
  }).length;

  return {
    total: users.length,
    admins: adminUsers,
    kiosks: kioskUsers,
    active: activeUsers
  };
};