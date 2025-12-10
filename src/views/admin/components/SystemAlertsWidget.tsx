import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../shared/ui/card";
import { Badge } from "../../../shared/ui/badge";
import { Button } from "../../../shared/ui/button";
import {
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
  ArrowRight,
  Shield,
} from "lucide-react";
import { SystemAlert, AlertSeverity } from "../../../shared/lib/hooks/useSystemAlerts";
import { Screen } from "../../../shared/types";
import { Skeleton } from "../../../shared/ui/skeleton";

interface SystemAlertsWidgetProps {
  alerts: SystemAlert[];
  loading: boolean;
  onNavigate: (screen: Screen) => void;
}

export function SystemAlertsWidget({
  alerts,
  loading,
  onNavigate,
}: SystemAlertsWidgetProps) {
  const getSeverityConfig = (severity: AlertSeverity) => {
    switch (severity) {
      case "critical":
        return {
          icon: AlertCircle,
          color: "text-red-600",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          badgeColor: "bg-red-100 text-red-800 border-red-200",
        };
      case "warning":
        return {
          icon: AlertTriangle,
          color: "text-orange-600",
          bgColor: "bg-orange-50",
          borderColor: "border-orange-200",
          badgeColor: "bg-orange-100 text-orange-800 border-orange-200",
        };
      case "info":
        return {
          icon: Info,
          color: "text-blue-600",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
        };
      case "success":
        return {
          icon: CheckCircle,
          color: "text-green-600",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          badgeColor: "bg-green-100 text-green-800 border-green-200",
        };
      default:
        return {
          icon: Info,
          color: "text-gray-600",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
          badgeColor: "bg-gray-100 text-gray-800 border-gray-200",
        };
    }
  };

  const getSeverityLabel = (severity: AlertSeverity) => {
    switch (severity) {
      case "critical":
        return "Critical";
      case "warning":
        return "Warning";
      case "info":
        return "Info";
      case "success":
        return "Success";
      default:
        return "Alert";
    }
  };

  const handleAlertClick = (alert: SystemAlert) => {
    if (alert.actionScreen) {
      onNavigate(alert.actionScreen as Screen);
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Shield className="h-5 w-5 text-indigo-600" />
            System Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Group alerts by severity for better organization
  const criticalAlerts = alerts.filter((a) => a.severity === "critical");
  const warningAlerts = alerts.filter((a) => a.severity === "warning");
  const infoAlerts = alerts.filter((a) => a.severity === "info");
  const successAlerts = alerts.filter((a) => a.severity === "success");
  const sortedAlerts = [
    ...criticalAlerts,
    ...warningAlerts,
    ...infoAlerts,
    ...successAlerts,
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Shield className="h-5 w-5 text-indigo-600" />
          System Alerts
          {alerts.length > 0 && (
            <Badge
              variant="secondary"
              className="ml-auto bg-indigo-100 text-indigo-800 border-indigo-200"
            >
              {alerts.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mb-3" />
            <p className="text-sm sm:text-base font-medium text-gray-900 mb-1">
              All systems operational
            </p>
            <p className="text-xs sm:text-sm text-gray-500">
              No issues detected. Your platform is running smoothly.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedAlerts.slice(0, 5).map((alert) => {
              const config = getSeverityConfig(alert.severity);
              const Icon = config.icon;

              return (
                <div
                  key={alert.id}
                  className={`
                    p-3 sm:p-4 rounded-lg border cursor-pointer transition-all
                    ${config.bgColor} ${config.borderColor}
                    hover:shadow-md hover:scale-[1.01]
                  `}
                  onClick={() => handleAlertClick(alert)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`flex-shrink-0 mt-0.5 ${config.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-1">
                            {alert.title}
                          </h4>
                          <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
                            {alert.message}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={`${config.badgeColor} text-xs flex-shrink-0`}
                        >
                          {getSeverityLabel(alert.severity)}
                        </Badge>
                      </div>
                      {alert.actionScreen && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2 h-7 text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAlertClick(alert);
                          }}
                        >
                          View Details
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {alerts.length > 5 && (
              <div className="pt-2 text-center">
                <p className="text-xs sm:text-sm text-gray-500">
                  +{alerts.length - 5} more alert{alerts.length - 5 !== 1 ? "s" : ""}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

