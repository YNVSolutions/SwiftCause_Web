import React, { useState } from 'react';
import { Button } from '../../shared/ui/button';
import { ArrowLeft, Mail, SendHorizontal, Loader2, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { submitFeedback, queueContactConfirmationEmail } from '../../shared/api/firestoreService';
import { useToast } from '../../shared/ui/ToastProvider';

const ContactInfoItem = ({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) => (
  <div className="flex items-start gap-4 rounded-2xl border border-[#e6e2d8] bg-white/80 p-4 shadow-sm">
    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
      {icon}
    </div>
    <div>
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <div className="mt-1 text-sm text-slate-600">{children}</div>
    </div>
  </div>
);

export function ContactPage({ onNavigate, onBack }: { onNavigate?: (screen: string) => void; onBack?: () => void }) {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    message: '',
    website: ''
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (formData.website.trim()) {
        setIsLoading(false);
        setIsSubmitted(true);
        return;
      }
      await submitFeedback(formData);
      let confirmationEmailFailed = false;
      try {
        await queueContactConfirmationEmail(formData);
      } catch (emailError) {
        confirmationEmailFailed = true;
        console.error('Error queueing confirmation email:', emailError);
      }
      setIsLoading(false);
      setIsSubmitted(true);
      if (confirmationEmailFailed) {
        showToast('Message saved. Confirmation email may be delayed.', 'error', 4000);
      } else {
        showToast('Message sent! We will get back to you soon.', 'success', 3000);
      }
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setIsLoading(false);
      setError('Failed to send message. Please try again.');
      showToast('Failed to send message. Please try again.', 'error', 4000);
    }
  };

  const handleChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-[#F3F1EA] font-['Helvetica',sans-serif] text-slate-700">
      <style jsx>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
        .hero-gradient {
          background: linear-gradient(180deg, #0f5132 0%, #064e3b 100%);
        }
      `}</style>
      <header className="sticky top-0 z-40">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between py-4 glass-card px-4 rounded-b-2xl">
          <button
            onClick={() => onNavigate && onNavigate('home')}
            className="flex items-center gap-3 text-left"
            aria-label="Go to home"
          >
            <img src="/logo.png" alt="SwiftCause" className="w-8 h-8" />
            <div>
              <span className="font-bold text-lg tracking-tight text-[#064e3b]">SwiftCause</span>
              <p className="text-[11px] text-slate-500">Donation Platform</p>
            </div>
          </button>
          <Button
            variant="ghost"
            onClick={() => (onBack ? onBack() : onNavigate && onNavigate('home'))}
            className="flex items-center gap-2 text-[#064e3b] border border-[#064e3b] px-4 py-2 rounded-2xl hover:bg-[#064e3b] hover:text-stone-50 transition-all duration-300"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-semibold">Back</span>
          </Button>
        </div>
      </header>

      <main className="py-10 sm:py-14">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-10 items-start">
            <section className="space-y-8">
              <div className="hero-gradient rounded-[2.5rem] overflow-hidden relative shadow-2xl shadow-green-900/10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl -mr-20 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-56 h-56 bg-emerald-300/10 rounded-full blur-3xl -ml-16 -mb-10"></div>
                <div className="relative px-8 py-10 sm:py-12 text-left">
                  <p className="text-emerald-100/80 text-xs tracking-[0.3em] uppercase">Contact</p>
                  <h1 className="mt-3 text-3xl sm:text-4xl font-semibold text-white leading-tight">
                    Let's talk about your next campaign.
                  </h1>
                  <p className="mt-4 text-sm sm:text-base text-emerald-50/85 leading-relaxed">
                    Tell us what you're building and we will point you to the right team.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <ContactInfoItem icon={<Mail size={22} />} title="Email Us">
                  <a href="mailto:swiftcauseweb@gmail.com" className="hover:text-[#064e3b] transition">
                    swiftcauseweb@gmail.com
                  </a>
                  <p className="text-xs text-slate-500">General & Support Inquiries</p>
                </ContactInfoItem>
                <ContactInfoItem icon={<Clock size={22} />} title="Response Time">
                  <p>Typically within 24 hours on business days</p>
                </ContactInfoItem>
              </div>
            </section>

            <section className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/30 border border-white/70 p-6 sm:p-8">
              {isSubmitted ? (
                <div className="text-center py-10">
                  <CheckCircle className="h-16 w-16 mx-auto text-emerald-500" />
                  <h2 className="mt-4 text-2xl font-bold text-slate-900">Message Sent!</h2>
                  <p className="mt-2 text-slate-600">
                    Thank you for reaching out. We'll get back to you as soon as possible.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="hidden" aria-hidden="true">
                    <label htmlFor="website">Website</label>
                    <input
                      type="text"
                      id="website"
                      tabIndex={-1}
                      autoComplete="off"
                      value={formData.website}
                      onChange={handleChange('website')}
                    />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400/70">Send a message</p>
                    <h2 className="mt-2 text-2xl font-semibold text-slate-900">How can we help?</h2>
                    <p className="mt-2 text-sm text-slate-500">
                      Share a few details and we'll respond with next steps.
                    </p>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start">
                      <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        required
                        value={formData.firstName}
                        onChange={handleChange('firstName')}
                        className="block w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm focus:ring-[#064e3b] focus:border-[#064e3b] transition bg-white"
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        required
                        value={formData.lastName}
                        onChange={handleChange('lastName')}
                        className="block w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm focus:ring-[#064e3b] focus:border-[#064e3b] transition bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      required
                      value={formData.email}
                      onChange={handleChange('email')}
                      className="block w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm focus:ring-[#064e3b] focus:border-[#064e3b] transition bg-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-1">
                      Message
                    </label>
                    <textarea
                      id="message"
                      rows={4}
                      required
                      value={formData.message}
                      onChange={handleChange('message')}
                      className="block w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm focus:ring-[#064e3b] focus:border-[#064e3b] transition bg-white"
                    />
                  </div>
                  <div>
                    <Button type="submit" className="w-full flex justify-center items-center py-3 px-6" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          Send Message <SendHorizontal className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
