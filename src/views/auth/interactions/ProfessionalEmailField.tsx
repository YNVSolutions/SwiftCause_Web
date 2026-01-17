import { useState, useEffect } from 'react';
import { Input } from '../../../shared/ui/input';
import { Label } from '../../../shared/ui/label';
import { Mail, CheckCircle, AlertTriangle } from 'lucide-react';

interface ProfessionalEmailFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  error?: string | null;
  id?: string;
}

export function ProfessionalEmailField({ 
  value, 
  onChange, 
  onBlur, 
  error, 
  id = 'email' 
}: ProfessionalEmailFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setIsValid(emailRegex.test(value));
  }, [value]);

  return (
    <div className="space-y-2">
      <Label 
        htmlFor={id} 
        className={`
          flex items-center space-x-2 text-sm font-medium
          transition-all duration-300
          ${isFocused ? 'text-green-600 scale-105' : 'text-gray-700'}
        `}
      >
        <Mail className={`w-4 h-4 transition-all duration-300 ${isFocused ? 'rotate-12' : ''}`} />
        <span>Email Address</span>
      </Label>
      
      <div className="relative">
        <div
          className={`
            relative border-2 rounded-lg
            transition-all duration-300
            ${isFocused ? 'border-green-500 ring-4 ring-green-200/50 scale-[1.02]' : 'border-gray-300'}
            ${error ? 'border-red-500 ring-4 ring-red-200/50 animate-shake' : ''}
            ${isValid && !error ? 'border-green-500' : ''}
          `}
        >
          <Input
            id={id}
            type="email"
            placeholder="you@example.com"
            value={value}
            onChange={onChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              setIsFocused(false);
              onBlur?.();
            }}
            className="h-12 px-4 pr-12 bg-transparent outline-none border-0 focus-visible:ring-0 focus-visible:border-transparent"
          />
          
          {/* Validation checkmark */}
          {isValid && value && !error && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <CheckCircle className="w-5 h-5 text-green-600 animate-scale-in" />
            </div>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <p className="text-xs text-red-600 flex items-center animate-slide-down">
          <AlertTriangle className="w-3 h-3 mr-1" />
          {error}
        </p>
      )}
    </div>
  );
}
