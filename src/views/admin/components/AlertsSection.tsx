import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../shared/ui/card';
import { Skeleton } from '../../../shared/ui/skeleton';
import { Badge } from '../../../shared/ui/badge';
import { Button } from '../../../shared/ui/button';
import { 
  Bell, 
  AlertCircle, 
  CheckCircle, 
  Info, 
  X,
  Monitor,
  Wifi,
  WifiOff
} from 'lucide-react';

interface Alert {
  id: string;
  type: 'warning' | 'info' | 'error' | 'success';
  message: string;
  priority: 'low' | 'medium' | 'high';
}

interface AlertsSectionProps {
  alerts?: Alert[];
  loading?: boolean;
  onDismissAlert?: (alertId: string) => void;
  className?: string;
}

const getAlertIcon = (type: string) => {
  switch (type) {
    case 'warning':
      return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    case 'error':
      return <AlertCircle className="w-4 h-4 text-red-600" />;
    case 'success':
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    case 'info':
    default:
      return <Info className="w-4 h-4 text-blue-600" />;
  }
};

const getAlertStyles = (type: string, priority: string) => {
  const baseStyles = "border-l-4 transition-all duration-200 hover:shadow-md";
  
  switch (type) {
    case 'warning':
      return `${baseStyles} border-l-yellow-500 bg-yellow-50 hover:bg-yellow-100`;
    case 'error':
      return `${baseStyles} border-l-red-500 bg-red-50 hover:bg-red-100`;
    case 'success':
      return `${baseStyles} border-l-green-500 bg-green-50 hover:bg-green-100`;
    case 'info':
    default:
      return `${baseStyles} border-l-blue-500 bg-blue-50 hover:bg-blue-100`;
  }
};

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case 'high':
      return <Badge className="bg-red-100 text-red-700 text-xs">High</Badge>;
    case 'medium':
      return <Badge className="bg-yellow-100 text-yellow-700 text-xs">Medium</Badge>;
    case 'low':
      return <Badge className="bg-gray-100 text-gray-700 text-xs">Low</Badge>;
    default:
      return null;
  }
};

export const AlertsSection: React.FC<AlertsSectionProps> = ({
  alerts = [],
  loading = false,
  onDismissAlert,
  className = '',
}) => {
  if (loading) {
    return (
      <Card className={`bg-white rounded-xl border border-gray-100 shadow-sm ${className}`}>
        <CardHeader className="px-4 pt-4 pb-2 border-b border-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-8 w-16" />
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-lg border">
                <Skeleton className="h-4 w-4 rounded-full flex-shrink-0 mt-0.5" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-6 w-12" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-white rounded-xl border border-gray-100 shadow-sm ${className}`}>
      <CardHeader className="px-4 pt-4 pb-2 border-b border-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
              <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center mr-3">
                <Bell className="w-4 h-4" />
              </div>
              Alerts & Notifications
            </CardTitle>
            <CardDescription className="text-sm text-gray-500 mt-0.5 ml-11">
              System alerts and important notifications
            </CardDescription>
          </div>
          {alerts.length > 0 && (
            <Badge className="bg-orange-100 text-orange-700 text-sm px-3 py-1 font-medium">
              {alerts.length} Active
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {alerts.length > 0 ? (
          <div className="space-y-2 max-h-52 overflow-y-auto">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-2.5 rounded-lg ${getAlertStyles(alert.type, alert.priority)}`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="flex-shrink-0 mt-0.5">
                    {getAlertIcon(alert.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm text-gray-900 break-words flex-1">
                        {alert.message}
                      </p>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {getPriorityBadge(alert.priority)}
                        {onDismissAlert && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDismissAlert(alert.id)}
                            className="h-5 w-5 p-0 hover:bg-gray-200 rounded-full"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {/* Additional context for kiosk alerts */}
                    {alert.message.includes('offline') && (
                      <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-600">
                        <WifiOff className="w-3 h-3" />
                        <span>Check network connection and device status</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-sm font-medium mb-1">All Systems Operational</p>
            <p className="text-xs text-gray-600 mb-3">
              No alerts or notifications at this time. Your kiosks and campaigns are running smoothly.
            </p>
            <div className="flex items-center justify-center gap-3 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Wifi className="w-3 h-3 text-green-500" />
                <span>All Kiosks Online</span>
              </div>
              <div className="flex items-center gap-1">
                <Monitor className="w-3 h-3 text-green-500" />
                <span>Systems Healthy</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};