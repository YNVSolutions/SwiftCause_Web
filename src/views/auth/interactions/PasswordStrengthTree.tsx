import { useState, useEffect } from 'react';
import { Input } from '../../../shared/ui/input';
import { Label } from '../../../shared/ui/label';
import { Shield, Eye, EyeOff, AlertTriangle } from 'lucide-react';

interface PasswordStrengthTreeProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  error?: string | null;
  id?: string;
}

type StrengthLevel = 'none' | 'weak' | 'medium' | 'strong';

export function PasswordStrengthTree({ value, onChange, onBlur, error, id = 'password' }: PasswordStrengthTreeProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [strength, setStrength] = useState<StrengthLevel>('none');
  const [capsLockOn, setCapsLockOn] = useState(false);

  useEffect(() => {
    if (!value) {
      setStrength('none');
      return;
    }

    let score = 0;
    if (value.length >= 8) score++;
    if (value.length >= 12) score++;
    if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score++;
    if (/\d/.test(value)) score++;
    if (/[^a-zA-Z0-9]/.test(value)) score++;

    if (score <= 2) setStrength('weak');
    else if (score <= 3) setStrength('medium');
    else setStrength('strong');
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    setCapsLockOn(e.getModifierState('CapsLock'));
  };

  const getTreeEmoji = () => {
    switch (strength) {
      case 'none': return '🌱';
      case 'weak': return '🌿';
      case 'medium': return '🌳';
      case 'strong': return '🌲';
    }
  };

  const getStrengthColor = () => {
    switch (strength) {
      case 'none': return 'text-gray-400';
      case 'weak': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'strong': return 'text-green-600';
    }
  };

  const getStrengthText = () => {
    switch (strength) {
      case 'none': return 'Enter password';
      case 'weak': return 'Weak - Add more characters';
      case 'medium': return 'Medium - Almost there';
      case 'strong': return 'Strong - Great password!';
    }
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
            className="h-12 px-4 pr-24 bg-transparent outline-none border-0 focus-visible:ring-0 focus-visible:border-transparent"
          />
          
          {/* Tree growth indicator and eye toggle */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-2">
            {value && (
              <span className={`text-2xl transition-all duration-500 ${strength !== 'none' ? 'animate-grow' : ''}`}>
                {getTreeEmoji()}
              </span>
            )}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5 animate-blink" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Caps Lock warning */}
        {capsLockOn && isFocused && (
          <div className="absolute left-4 -top-8 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded shadow-lg animate-bounce">
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

      {/* Strength indicator */}
      {value && !error && (
        <div className="space-y-1 animate-fade-in">
          <div className="flex items-center justify-between text-xs">
            <span className={`font-medium ${getStrengthColor()}`}>
              {getStrengthText()}
            </span>
          </div>
          <div className="flex space-x-1">
            {[1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={`
                  h-1 flex-1 rounded-full transition-all duration-500
                  ${level === 1 && strength !== 'none' ? 'bg-red-500' : 'bg-gray-200'}
                  ${level === 2 && (strength === 'medium' || strength === 'strong') ? 'bg-yellow-500' : ''}
                  ${level === 3 && strength === 'strong' ? 'bg-green-500' : ''}
                  ${level === 4 && strength === 'strong' ? 'bg-green-600' : ''}
                `}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
