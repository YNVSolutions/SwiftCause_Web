import React, { useEffect } from 'react';
import { CheckCircle2, Info, AlertTriangle, XCircle, X } from 'lucide-react';
import { Button } from './button';

interface PersistentNotificationProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'success' | 'info' | 'warning' | 'error';
}

export function PersistentNotification({
  isOpen,
  onClose,
  title,
  message,
  type = 'success',
}: PersistentNotificationProps) {
  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when notification is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const typeConfig = {
    success: {
      icon: <CheckCircle2 className="w-6 h-6" />,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-500',
      iconColor: 'text-green-600',
      titleColor: 'text-green-900',
      textColor: 'text-green-800',
    },
    info: {
      icon: <Info className="w-6 h-6" />,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-500',
      iconColor: 'text-blue-600',
      titleColor: 'text-blue-900',
      textColor: 'text-blue-800',
    },
    warning: {
      icon: <AlertTriangle className="w-6 h-6" />,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-500',
      iconColor: 'text-yellow-600',
      titleColor: 'text-yellow-900',
      textColor: 'text-yellow-800',
    },
    error: {
      icon: <XCircle className="w-6 h-6" />,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-500',
      iconColor: 'text-red-600',
      titleColor: 'text-red-900',
      textColor: 'text-red-800',
    },
  };

  const config = typeConfig[type];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9998] transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Notification */}
      <div className="fixed bottom-6 right-6 z-[9999] animate-in slide-in-from-bottom-5 duration-300">
        <div
          className={`
            ${config.bgColor} ${config.borderColor}
            border-l-4 rounded-lg shadow-2xl
            max-w-md w-full sm:w-96
            p-5
            transform transition-all duration-300
          `}
        >
          <div className="flex items-start space-x-4">
            {/* Icon */}
            <div className={`flex-shrink-0 ${config.iconColor}`}>
              {config.icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className={`text-base font-semibold ${config.titleColor} mb-2`}>
                {title}
              </h3>
              <p className={`text-sm ${config.textColor} leading-relaxed`}>
                {message}
              </p>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className={`
                flex-shrink-0 ${config.iconColor} hover:opacity-70
                transition-opacity duration-200
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${type}-500
                rounded-full p-1
              `}
              aria-label="Dismiss notification"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Dismiss Button */}
          <div className="mt-4 flex justify-end">
            <Button
              onClick={onClose}
              variant="outline"
              size="sm"
              className={`
                ${config.borderColor} ${config.textColor}
                hover:bg-white/50 transition-colors duration-200
              `}
            >
              Dismiss
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
