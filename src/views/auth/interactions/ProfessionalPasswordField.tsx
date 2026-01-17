import { useState } from 'react';
import { Input } from '../../../shared/ui/input';
import { Label } from '../../../shared/ui/label';
import { Shield, Eye, EyeOff, AlertTriangle } from 'lucide-react';

interface ProfessionalPasswordFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  error?: string | null;
  id?: string;
}

export function ProfessionalPasswordField({ 
  value, 
  onChange, 
  onBlur, 
  error, 
  id = 'password' 
}: ProfessionalPasswordFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    setCapsLockOn(e.getModifierState('CapsLock'));
  };

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
        <Shield className={`w-4 h-4 transition-all duration-300 ${isFocused ? 'rotate-12' : ''}`} />
        <span>Password</span>
      </Label>
      
      <div className="relative">
        <div
          className={`
            relative border-2 rounded-lg
            transition-all duration-300
            ${isFocused ? 'border-green-500 ring-4 ring-green-200/50 scale-[1.02]' : 'border-gray-300'}
            ${error ? 'border-red-500 ring-4 ring-red-200/50 animate-shake' : ''}
          `}
        >
          <Input
            id={id}
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            value={value}
            onChange={onChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              setIsFocused(false);
              onBlur?.();
            }}
            className="h-12 px-4 pr-12 bg-transparent outline-none border-0 focus-visible:ring-0 focus-visible:border-transparent"
          />
          
          {/* Eye toggle */}
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5 animate-blink" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Caps Lock warning */}
        {capsLockOn && isFocused && (
          <div className="absolute left-4 -top-8 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded shadow-lg animate-bounce z-10">
            ⚠️ Caps Lock is ON
          </div>
        )}
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
