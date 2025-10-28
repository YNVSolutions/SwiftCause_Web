import React, { useState } from 'react';
import { Button } from '../../shared/ui/button';
import { ArrowLeft, Mail, Phone, Building, SendHorizontal, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Footer } from '../../shared/ui/Footer';
import swiftCauseLogo from '../../shared/assets/logo.png';
import { submitFeedback } from '../../shared/api/firestoreService';

const ContactInfoItem = ({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) => (
  <div className="flex items-start">
    <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center bg-indigo-50 rounded-lg text-indigo-600">
      {icon}
    </div>
    <div className="ml-4">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <div className="mt-1 text-gray-600">{children}</div>
    </div>
  </div>
);

export function ContactPage({ onNavigate }: { onNavigate?: (screen: string) => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    message: ''
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await submitFeedback(formData);
      setIsLoading(false);
      setIsSubmitted(true);
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setIsLoading(false);
      setError('Failed to send message. Please try again.');
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
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8">
              <img 
                src={swiftCauseLogo.src} 
                alt="Swift Cause Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Swift Cause</h1>
              <p className="text-xs text-gray-600">Donation Platform</p>
            </div>
          </div>
          
          <Button variant="ghost" onClick={() => onNavigate && onNavigate('home')} className="flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-5 w-5 mr-2" /> Back to Home
          </Button>
        </div>
      </header>

      <main className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-start">
            <div className="prose max-w-none text-gray-700 lg:max-w-lg">
              <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Get in Touch</h1>
              <p className="mt-4 text-lg text-gray-600">
                We're here to help and answer any question you might have. We look forward to hearing from you.
              </p>
              <div className="mt-12 space-y-8 not-prose">
                <ContactInfoItem icon={<Mail size={24} />} title="Email Us">
                  <a href="mailto:swiftcauseweb@gmail.com" className="hover:text-indigo-600 transition">swiftcauseweb@gmail.com</a>
                  <p className="text-sm">General & Support Inquiries</p>
                </ContactInfoItem>
                <ContactInfoItem icon={<Building size={24} />} title="Our Office">
                  <p>Soon to be announced</p>
                </ContactInfoItem>
              </div>
            </div>

            <div className="mt-12 lg:mt-0 bg-white p-8 sm:p-10 rounded-2xl shadow-lg">
              {isSubmitted ? (
                <div className="text-center py-10">
                  <CheckCircle className="h-16 w-16 mx-auto text-green-500" />
                  <h2 className="mt-4 text-2xl font-bold text-gray-900">Message Sent!</h2>
                  <p className="mt-2 text-gray-600">Thank you for reaching out. We'll get back to you as soon as possible.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start">
                      <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                      <input 
                        type="text" 
                        id="firstName" 
                        required 
                        value={formData.firstName}
                        onChange={handleChange('firstName')}
                        className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition" 
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                      <input 
                        type="text" 
                        id="lastName" 
                        required 
                        value={formData.lastName}
                        onChange={handleChange('lastName')}
                        className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition" 
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input 
                      type="email" 
                      id="email" 
                      required 
                      value={formData.email}
                      onChange={handleChange('email')}
                      className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition" 
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <textarea 
                      id="message" 
                      rows={4} 
                      required 
                      value={formData.message}
                      onChange={handleChange('message')}
                      className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition" 
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
            </div>
          </div>
        </div>
      </main>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}