import { Input } from '../../../shared/ui/input';
import { Label } from '../../../shared/ui/label';
import { Mail, AlertTriangle, Loader2 } from 'lucide-react';

interface ProfessionalEmailFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  error?: string | null;
  id?: string;
  isChecking?: boolean;
}

export function ProfessionalEmailField({ 
  value, 
  onChange, 
  onBlur, 
  error, 
  id = 'email',
  isChecking = false
}: ProfessionalEmailFieldProps) {
  return (
    <div className="space-y-2">
      <Label 
        htmlFor={id} 
        className="flex items-center space-x-2 text-sm font-medium text-[#2f4f43]"
      >
        <Mail className="h-4 w-4" />
        <span>Email Address</span>
      </Label>
      
      <div className="relative w-full">
        <div
          className={`relative rounded-2xl border border-[#d7ded9] bg-[#f6f7f4] transition-colors duration-200 focus-within:border-[#2f4f43] focus-within:bg-white overflow-hidden ${
            error ? 'border-red-400 bg-[#fff5f5] focus-within:border-red-400' : ''
          }`}
        >
          <Input
            id={id}
            type="email"
            placeholder="you@example.com"
            value={value}
            onChange={onChange}
            onBlur={() => {
              onBlur?.();
            }}
            className="h-12 px-4 pr-10 bg-transparent text-sm text-[#1f2937] placeholder:text-[#9aa09b] outline-none border-0 focus-visible:ring-0 focus-visible:border-transparent w-full"
          />
          
          {isChecking && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
            </div>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <p className="text-xs text-red-600 flex items-center">
          <AlertTriangle className="w-3 h-3 mr-1" />
          {error}
        </p>
      )}
    </div>
  );
}
