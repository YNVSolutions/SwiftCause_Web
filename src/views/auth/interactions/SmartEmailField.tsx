import { useState, useEffect } from 'react';
import { Input } from '../../../shared/ui/input';
import { Label } from '../../../shared/ui/label';
import { Mail, CheckCircle, AlertTriangle } from 'lucide-react';

interface SmartEmailFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  error?: string | null;
  id?: string;
}

const emailProviders = [
  { domain: 'gmail.com', color: 'text-red-500', icon: '📧' },
  { domain: 'outlook.com', color: 'text-blue-500', icon: '📨' },
  { domain: 'yahoo.com', color: 'text-purple-500', icon: '📬' },
  { domain: 'hotmail.com', color: 'text-blue-600', icon: '📮' },
  { domain: 'icloud.com', color: 'text-gray-600', icon: '☁️' },
];

export function SmartEmailField({ value, onChange, onBlur, error, id = 'email' }: SmartEmailFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [provider, setProvider] = useState<typeof emailProviders[0] | null>(null);

  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setIsValid(emailRegex.test(value));

    // Detect provider
    const detectedProvider = emailProviders.find(p => value.toLowerCase().includes(p.domain));
    setProvider(detectedProvider || null);
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
          
          {/* Provider icon or validation icon */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-2">
            {provider && !error && (
              <span className="text-xl animate-bounce-slow">{provider.icon}</span>
            )}
            {isValid && value && !error && (
              <CheckCircle className="w-5 h-5 text-green-600 animate-scale-in" />
            )}
          </div>
        </div>

        {/* Floating label animation */}
        {isFocused && !value && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none animate-float-label">
            Enter your email...
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

      {/* Provider hint */}
      {provider && !error && value && (
        <p className="text-xs text-gray-500 flex items-center animate-fade-in">
          <span className={provider.color}>●</span>
          <span className="ml-1">Detected {provider.domain}</span>
        </p>
      )}
    </div>
  );
}
