import React, { useState, useEffect } from 'react';
import { Button } from '../../shared/ui/button';
import { ArrowLeft, AlertTriangle, FileText, CheckCircle, ExternalLink } from 'lucide-react';
import { Footer } from '../../shared/ui/Footer';

export function TermsPage({ onNavigate }: { onNavigate?: (screen: string) => void }) {
  const effectiveDate = 'September 28, 2025';

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const PointBox = ({ children }: { children: React.ReactNode }) => (
    <li className="flex items-start bg-gray-50/70 p-3 sm:p-4 rounded-lg border border-gray-200 transition-all duration-300 ease-in-out hover:shadow-lg hover:bg-white hover:border-green-300 transform hover:-translate-y-1">
      <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-2 sm:mr-3 mt-0.5 flex-shrink-0" />
      <span className="flex-1 text-sm sm:text-base text-gray-700 leading-relaxed">{children}</span>
    </li>
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 sm:h-10 sm:w-10">
              <img 
                src="/logo.png"
                alt="Swift Cause Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Swift Cause</h1>
              <p className="text-xs text-gray-600">Donation Platform</p>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            onClick={() => onNavigate && onNavigate('home')} 
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
            aria-label="Go back to home page"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-2" /> 
            <span className="text-sm sm:text-base">Back</span>
          </Button>
        </div>
      </header>

      <main role="main">
        <section className="relative py-6 sm:py-10 lg:py-14 bg-gradient-to-b from-green-50 to-gray-50" aria-labelledby="terms-title">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex items-center justify-center mx-auto h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-green-100 text-green-600 mb-4 sm:mb-6" aria-hidden="true">
              <FileText className="h-7 w-7 sm:h-8 sm:w-8" />
            </div>
            <h1 id="terms-title" className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight mb-3 sm:mb-4">
              Terms of Service
            </h1>
            <p className="text-base sm:text-lg text-gray-600">
              Last Updated: <time dateTime="2025-09-28">{effectiveDate}</time>
            </p>
          </div>
        </section>

        <section 
          className={`px-4 sm:px-6 lg:px-8 py-16 sm:py-20 transition-opacity duration-700 ease-in ${isVisible ? 'opacity-100' : 'opacity-0'}`}
          aria-labelledby="terms-content"
        >
          <div className="max-w-4xl mx-auto bg-white p-6 sm:p-8 lg:p-12 rounded-2xl shadow-lg">
            <h2 id="terms-content" className="sr-only">Terms of Service Content</h2>
            
            <div className="mb-8 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg" role="alert" aria-live="polite">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-6 w-6 text-yellow-500" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-base font-semibold text-yellow-800">Disclaimer for Platform Owner</h3>
                  <p className="text-sm text-yellow-700 mt-1 leading-relaxed">
                    This is a template and not legal advice. You must consult with a qualified legal professional to ensure your Terms are compliant with all applicable laws.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6 sm:space-y-8 text-gray-700">
              <section className="space-y-3 sm:space-y-4">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2">1. Acceptance of Terms</h2>
                <p className="text-base leading-relaxed">
                  Welcome to SwiftCause ("we," "us," or "our"). These Terms of Service ("Terms") govern your use of our website, mobile applications, and services (collectively, the "Service"). By creating an account or using our Service, you agree to be bound by these Terms. If you do not agree to these Terms, do not use the Service.
                </p>
              </section>

              <section className="space-y-3 sm:space-y-4">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2">2. Description of Service</h2>
                <p className="text-base leading-relaxed">
                  SwiftCause provides an online platform that enables nonprofit organizations ("Campaign Creators") to create and manage fundraising campaigns to accept monetary donations from individuals ("Donors").
                </p>
              </section>

              <section className="space-y-3 sm:space-y-4">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2">3. For Campaign Creators (Nonprofits)</h2>
                <p className="text-base leading-relaxed">
                  You represent and warrant that you are an authorized representative of a legally registered nonprofit organization. You agree to:
                </p>
                <ul className="list-none p-0 grid grid-cols-1 gap-3 sm:gap-4 my-4 sm:my-6">
                  <PointBox>Provide accurate and complete information when creating an account and campaign.</PointBox>
                  <PointBox>Use all donated funds solely for the purposes stated in your campaign.</PointBox>
                  <PointBox>Comply with all applicable laws and regulations, including tax and financial reporting requirements. SwiftCause is not responsible for your compliance with Gift Aid regulations.</PointBox>
                  <PointBox>Not post content that is fraudulent, misleading, illegal, defamatory, or hateful.</PointBox>
                </ul>
              </section>

              <section className="space-y-3 sm:space-y-4">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2">4. For Donors</h2>
                <p className="text-base leading-relaxed">
                  By making a donation through the Service, you agree that:
                </p>
                <ul className="list-none p-0 grid grid-cols-1 gap-3 sm:gap-4 my-4 sm:my-6">
                  <PointBox>Your donation is a voluntary contribution. All donations are final and non-refundable.</PointBox>
                  <PointBox>SwiftCause does not endorse any campaign and is not responsible for the use of your donation by the Campaign Creator. We provide the technology platform but do not guarantee the truthfulness of any campaign.</PointBox>
                  <PointBox>You are responsible for ensuring you are eligible for any tax benefits, such as Gift Aid, and for maintaining your own records.</PointBox>
                </ul>
              </section>

              <section className="space-y-3 sm:space-y-4">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2">5. Fees and Payments</h2>
                <p className="text-base leading-relaxed">
                  SwiftCause may charge a platform fee, which will be disclosed at the time of a transaction. All payments are processed through third-party payment gateways (e.g., Stripe, SumUp). These gateways may charge their own processing fees. SwiftCause is not responsible for the performance of these third-party processors.
                </p>
              </section>
              
              <section className="space-y-3 sm:space-y-4">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2">6. Intellectual Property</h2>
                <p className="text-base leading-relaxed">
                  Our Service, including our logo, branding, and software, is the exclusive property of SwiftCause. Campaign Creators retain ownership of the content they upload but grant us a worldwide, non-exclusive, license to display and distribute it in connection with providing the Service.
                </p>
              </section>

              <section className="space-y-3 sm:space-y-4">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2">7. Prohibited Conduct</h2>
                <p className="text-base leading-relaxed">
                  You agree not to use the Service to violate any law, engage in fraudulent activity, infringe on intellectual property rights, upload malicious code, or attempt to disrupt our systems.
                </p>
              </section>

              <section className="space-y-3 sm:space-y-4">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2">8. Disclaimer of Warranties and Limitation of Liability</h2>
                <p className="text-base leading-relaxed font-medium text-gray-800">
                  THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE." TO THE FULLEST EXTENT PERMITTED BY LAW, IN NO EVENT WILL SWIFTCAUSE BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES.
                </p>
              </section>

              <section className="space-y-3 sm:space-y-4">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2">9. Governing Law</h2>
                <p className="text-base leading-relaxed">
                  These Terms shall be governed by the laws of England and Wales.
                </p>
              </section>

              <section className="space-y-3 sm:space-y-4">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2">10. Changes to These Terms</h2>
                <p className="text-base leading-relaxed">
                  We reserve the right to modify these Terms at any time. We will notify you of changes by posting the new Terms on this page and updating the "Last Updated" date.
                </p>
              </section>

             
            </div>
          </div>
        </section>
      </main>
      
      <Footer onNavigate={onNavigate} />
    </div>
  );
}
