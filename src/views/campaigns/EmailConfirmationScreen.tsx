import { useState, FormEvent, ChangeEvent } from 'react';
import { createThankYouMail, attachDonorEmailToDonation } from '../../shared/api';
import { Mail, Send, Home, CheckCircle } from 'lucide-react';
import { KioskHeader } from '../../shared/components/KioskHeader';

interface EmailConfirmationScreenProps {
  transactionId?: string;
  onComplete: () => void;
}

export function EmailConfirmationScreen({ transactionId, onComplete }: EmailConfirmationScreenProps) {
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setError(null);

    try {
      if (transactionId) {
        try {
          const updated = await attachDonorEmailToDonation(transactionId, email);
          if (!updated) {
            console.warn('No donation found to attach email for transaction', transactionId);
          }
        } catch (err) {
          console.error('Error updating donation with donorEmail', err);
        }
      }

      await createThankYouMail(email);
      setEmailSent(true);
    } catch (err) {
      console.error('Error sending receipt email:', err);
      setError('There was an issue sending your receipt. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  if (emailSent) {
    return (
      <div className="h-screen flex flex-col bg-[#FAFAFA]">
        <KioskHeader title="Email Sent" />

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
                <h2 className="text-2xl lg:text-3xl font-bold mb-2">Email Sent!</h2>
                <p className="text-white/80">Your receipt has been sent to {email}</p>
              </div>

              <div className="p-8 lg:p-10">
                {/* Message */}
                <div className="text-center mb-8">
                  <p className="text-gray-600 leading-relaxed">
                    Please check your email inbox for the receipt. If you don't see it, please check your spam folder.
                  </p>
                </div>

                {/* Action Button */}
                <button
                  onClick={onComplete}
                  className="w-full h-14 rounded-xl font-medium text-white flex items-center justify-center gap-2 transition-colors"
                  style={{ backgroundColor: '#159A6F' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#128A62')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#159A6F')}
                >
                  <Home className="w-5 h-5" />
                  Back to Campaigns
                </button>

                {/* Footer Message */}
                <div className="mt-8 text-center">
                  <p className="text-sm text-gray-400">
                    Thank you for your donation!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#FAFAFA]">
      <KioskHeader title="Send Receipt" backText="Skip" onBack={handleSkip} />

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-xl">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-[#159A6F] text-white p-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                  <Mail className="w-10 h-10" />
                </div>
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold mb-2">Send Receipt</h2>
              <p className="text-white/80">Would you like to receive a donation receipt by email?</p>
            </div>

            <div className="p-8 lg:p-10">
              <form onSubmit={handleSubmit}>
                {/* Transaction ID */}
                {transactionId && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-xl text-center">
                    <p className="text-sm text-gray-500 mb-1">Transaction Id</p>
                    <p className="font-mono text-sm text-[#0A0A0A]">{transactionId}</p>
                  </div>
                )}

                {/* Email Input */}
                <div className="mb-6">
                  <label htmlFor="email" className="block text-sm font-medium text-[#0A0A0A] mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    required
                    disabled={isSending}
                    className="w-full h-14 px-4 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#159A6F] focus:ring-1 focus:ring-[#159A6F] disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    We'll only use this email to send your receipt
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-sm text-red-700 text-center">{error}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-4">
                  <button
                    type="submit"
                    disabled={isSending || !email}
                    className="w-full h-14 rounded-xl font-medium text-white flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: isSending || !email ? '#9CA3AF' : '#159A6F' }}
                    onMouseEnter={(e) => {
                      if (!isSending && email) e.currentTarget.style.backgroundColor = '#128A62';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSending && email) e.currentTarget.style.backgroundColor = '#159A6F';
                    }}
                  >
                    {isSending ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Send Receipt
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleSkip}
                    disabled={isSending}
                    className="w-full h-14 rounded-xl font-medium border-2 border-gray-200 text-[#0A0A0A] flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Skip Email Receipt
                  </button>
                </div>

                {/* Footer Message */}
                <div className="mt-8 text-center">
                  <p className="text-sm text-gray-400">
                    Your donation has been successfully processed. Email receipt is optional.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
