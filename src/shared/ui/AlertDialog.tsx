import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './dialog';
import { Button } from './button';
import { AlertCircle, CheckCircle, InfoIcon } from 'lucide-react';
import { capitalizeFirstLetter } from './alertDialogUtils';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertState {
  isOpen: boolean;
  title: string;
  message: string;
  type: AlertType;
  onConfirm?: () => void;
}

export function useAlertDialog() {
  const [alertState, setAlertState] = useState<AlertState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
  });

  const showAlert = useCallback(
    (message: string, type: AlertType = 'info', title?: string) => {
      setAlertState({
        isOpen: true,
        title: title || capitalizeFirstLetter(type),
        message,
        type,
      });
    },
    []
  );

  const closeAlert = useCallback(() => {
    setAlertState(prev => ({
      ...prev,
      isOpen: false,
    }));
  }, []);

  return {
    alertState,
    showAlert,
    closeAlert,
  };
}

interface AlertDialogComponentProps {
  isOpen: boolean;
  title: string;
  message: string;
  type: AlertType;
  onClose: () => void;
}

export function AlertDialogComponent({
  isOpen,
  title,
  message,
  type,
  onClose,
}: AlertDialogComponentProps) {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'info':
      default:
        return <InfoIcon className="w-5 h-5 text-blue-600" />;
    }
  };

  const getDialogVariant = () => {
    switch (type) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'info':
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={getDialogVariant()}>
        <DialogTitle className="flex items-center gap-2 text-lg">
          {getIcon()}
          <span>{title}</span>
        </DialogTitle>
        <DialogDescription className="text-base text-foreground">
          {message}
        </DialogDescription>
        <DialogFooter>
          <Button onClick={onClose} className="w-full sm:w-auto">
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
