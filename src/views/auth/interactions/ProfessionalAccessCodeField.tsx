import { useState } from 'react';
import { Input } from '../../../shared/ui/input';
import { Label } from '../../../shared/ui/label';
import { KeyRound, Eye, EyeOff, AlertTriangle } from 'lucide-react';

interface ProfessionalAccessCodeFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  error?: string | null;
  id?: string;
}

export function ProfessionalAccessCodeField({ 
  value, 
  onChange, 
  onBlur, 
  error, 
  id = 'accessCode' 
}: ProfessionalAccessCodeFieldProps) {
  const [showCode, setShowCode] = useState(false);

  return (
    <div className="space-y-2">
      <Label 
        htmlFor={id} 
        className="flex items-center space-x-2 text-sm font-medium text-[#2f4f43]"
      >
        <KeyRound className="h-4 w-4" />
        <span>Access Code</span>
      </Label>
      
      <div className="relative">
        <div
          className={`relative rounded-2xl border border-[#d7ded9] bg-[#f6f7f4] transition-colors duration-200 focus-within:border-[#2f4f43] focus-within:bg-white ${
            error ? 'border-red-400 bg-[#fff5f5] focus-within:border-red-400' : ''
          }`}
        >
          <Input
            id={id}
            type={showCode ? 'text' : 'password'}
            placeholder="Enter kiosk access code"
            value={value}
            onChange={onChange}
            onBlur={() => {
              onBlur?.();
            }}
            className="h-12 px-4 pr-12 bg-transparent text-sm text-[#1f2937] placeholder:text-[#9aa09b] outline-none border-0 focus-visible:ring-0 focus-visible:border-transparent"
          />
          
          <button
            type="button"
            onClick={() => setShowCode(!showCode)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7280] hover:text-[#1f2937] transition-colors"
          >
            {showCode ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-600 flex items-center">
          <AlertTriangle className="h-3 w-3 mr-1" />
          {error}
        </p>
      )}
    </div>
  );
}
