'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'
import { Toast, ToastHost } from './Toast'

type ToastVariant = 'success' | 'error' | 'warning' | 'info'

interface ToastContextType {
  showToast: (message: string, variant?: ToastVariant, durationMs?: number) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

interface ToastProviderProps {
  children: ReactNode
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [isToastVisible, setIsToastVisible] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastVariant, setToastVariant] = useState<ToastVariant>('info')

  const showToast = (
    message: string,
    variant: ToastVariant = 'info',
    _durationMs = 2500
  ) => {
    setToastMessage(message)
    setToastVariant(variant)
    setIsToastVisible(true)
  }

  const value: ToastContextType = {
    showToast,
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastHost 
        visible={isToastVisible} 
        onClose={() => setIsToastVisible(false)} 
        align="top"
      >
        <Toast 
          message={toastMessage} 
          variant={toastVariant} 
          onClose={() => setIsToastVisible(false)} 
        />
      </ToastHost>
    </ToastContext.Provider>
  )
}
