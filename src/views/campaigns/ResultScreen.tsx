import { CheckCircle, XCircle, Mail, Home, RefreshCw } from 'lucide-react';
import { PaymentResult } from '../../shared/types';
import { KioskHeader } from '../../shared/components/KioskHeader';

interface ResultScreenProps {
  result: PaymentResult;
  onEmailConfirmation?: () => void;
  onReturnToStart: () => void;
}

export function ResultScreen({ result, onEmailConfirmation, onReturnToStart }: ResultScreenProps) {
  if (result.success) {
    return (
      <div className="h-screen flex flex-col bg-[#FAFAFA]">
        <KioskHeader title="Donation Complete" backText="Done" onBack={onReturnToStart} />

        <main className="flex-1 flex items-center justify-center px-4">
          <div className="w-full max-w-xl">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Success Header */}
              <div className="bg-[#159A6F] text-white p-8 text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-12 h-12" />
                  </div>
                </div>
                <h2 className="text-2xl lg:text-3xl font-bold mb-2">Thank You!</h2>
                <p className="text-white/80">Your donation has been processed successfully.</p>
              </div>

              <div className="p-8 lg:p-10">
                {/* Transaction ID */}
                {result.transactionId && (
                  <div className="mb-8 p-4 bg-gray-50 rounded-xl text-center">
                    <p className="text-sm text-gray-500 mb-1">Transaction ID</p>
                    <p className="font-mono text-sm text-[#0A0A0A]">{result.transactionId}</p>
                  </div>
                )}

                {/* Message */}
                <div className="text-center mb-8">
                  <p className="text-gray-600 leading-relaxed">
                    Your generosity is making a real difference. A receipt has been generated and you can optionally send it to your email.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-4">
                  {onEmailConfirmation && (
                    <button
                      onClick={onEmailConfirmation}
                      className="w-full h-14 rounded-xl font-medium text-white flex items-center justify-center gap-2 transition-colors"
                      style={{ backgroundColor: '#159A6F' }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#128A62')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#159A6F')}
                    >
                      <Mail className="w-5 h-5" />
                      Send Receipt to Email
                    </button>
                  )}

                  <button
                    onClick={onReturnToStart}
                    className="w-full h-14 rounded-xl font-medium border-2 border-gray-200 text-[#0A0A0A] flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                  >
                    <Home className="w-5 h-5" />
                    Return to Campaigns
                  </button>
                </div>

                {/* Footer Message */}
                <div className="mt-8 text-center">
                  <p className="text-sm text-gray-400">
                    Thank you for using our donation kiosk.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Failed state
  return (
    <div className="h-screen flex flex-col bg-[#FAFAFA]">
      <KioskHeader title="Payment Failed" backText="Back" onBack={onReturnToStart} />

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-xl">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Error Header */}
            <div className="bg-red-500 text-white p-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                  <XCircle className="w-12 h-12" />
                </div>
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold mb-2">Payment Failed</h2>
              <p className="text-white/80">We encountered an issue processing your donation.</p>
            </div>

            <div className="p-8 lg:p-10">
              {/* Error Message */}
              {result.error && (
                <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-700 text-center">{result.error}</p>
                </div>
              )}

              {/* Common Reasons */}
              <div className="mb-8">
                <p className="text-gray-600 text-center mb-4">Common reasons for payment failure:</p>
                <ul className="text-gray-500 text-sm space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                    Insufficient funds
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                    Incorrect card information
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                    Card expired or blocked
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                    Network connectivity issues
                  </li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <button
                  onClick={onReturnToStart}
                  className="w-full h-14 rounded-xl font-medium text-white flex items-center justify-center gap-2 transition-colors"
                  style={{ backgroundColor: '#159A6F' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#128A62')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#159A6F')}
                >
                  <RefreshCw className="w-5 h-5" />
                  Try Again
                </button>

                <button
                  onClick={onReturnToStart}
                  className="w-full h-14 rounded-xl font-medium border-2 border-gray-200 text-[#0A0A0A] flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                >
                  <Home className="w-5 h-5" />
                  Return to Campaigns
                </button>
              </div>

              {/* Support Info */}
              <div className="mt-8 text-center">
                <p className="text-sm text-gray-400">
                  If you continue to experience issues, please contact support.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
