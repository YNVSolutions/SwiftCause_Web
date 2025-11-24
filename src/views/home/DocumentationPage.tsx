import React, { useState } from 'react';
import { Button } from '../../shared/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../shared/ui/dialog';
import { 
  ArrowLeft, 
  Rocket, 
  WalletCards, 
  Target, 
  Smartphone, 
  Gift, 
  Users,
  BookUser,
  Shield,
  HelpCircle,
  Gavel,
  FileText,
  ArrowRight
} from 'lucide-react';
import { Footer } from '../../shared/ui/Footer';
import Image from 'next/image';


const userDocs = [
  {
    icon: <Rocket size={24} />,
    title: "Getting Started Guide",
    description: "Your first steps: signing up, creating a profile, and navigating the dashboard.",
    details: [
      "Create your nonprofit account with basic organization information",
      "Set up your organization profile with logo and mission statement",
      "Navigate the dashboard to understand key features and metrics",
      "Complete your first campaign setup with guided walkthrough",
      "Learn about donation tracking and reporting features"
    ]
  },
  {
    icon: <WalletCards size={24} />,
    title: "Connecting a Payment Gateway",
    description: "Securely link your Stripe or SumUp account to start accepting donations.",
    details: [
      "Choose between Stripe or SumUp payment processors",
      "Connect your existing merchant account or create a new one",
      "Configure payment settings and currency preferences",
      "Test payment processing with demo transactions",
      "Set up webhook notifications for real-time updates"
    ]
  },
  {
    icon: <Target size={24} />,
    title: "Campaign Management",
    description: "Learn how to create, edit, and publish a beautiful fundraising campaign.",
    details: [
      "Design compelling campaign pages with custom images and descriptions",
      "Set fundraising goals and target amounts",
      "Configure donation amounts and suggested giving levels",
      "Schedule campaign start and end dates",
      "Monitor campaign performance with real-time analytics"
    ]
  },
  {
    icon: <Smartphone size={24} />,
    title: "Using Kiosk Mode",
    description: "Turn any mobile device into a tap-to-donate terminal for live events.",
    details: [
      "Enable kiosk mode for secure, single-purpose operation",
      "Configure quick donation amounts for easy selection",
      "Display campaign information and progress on screen",
      "Process contactless payments with NFC technology",
      "Generate receipts and donation confirmations"
    ]
  },
  {
    icon: <Gift size={24} />,
    title: "Understanding Gift Aid (UK)",
    description: "Enable and manage Gift Aid to maximize the value of your UK donations.",
    details: [
      "Register for Gift Aid with HMRC if not already registered",
      "Enable Gift Aid collection in your campaign settings",
      "Collect donor declarations during the donation process",
      "Submit Gift Aid claims through the platform",
      "Track Gift Aid earnings and compliance requirements"
    ]
  },
  {
    icon: <Users size={24} />,
    title: "Team Management",
    description: "Invite team members and assign roles like Admin, Editor, or Viewer.",
    details: [
      "Invite team members via email with role-based permissions",
      "Assign Admin, Editor, or Viewer roles with appropriate access levels",
      "Manage team member permissions for campaigns and settings",
      "Track team activity and contribution metrics",
      "Remove or modify team member access as needed"
    ]
  }
];

const legalDocs = [
  {
    icon: <HelpCircle size={24} />,
    title: "Contact & Support",
    description: "Get in touch with our support team, find our office details, and send us your questions.",
    page: "contact" 
  },
  {
    icon: <Gavel size={24} />,
    title: "Terms of Service",
    description: "Read our comprehensive legal terms covering platform usage, user responsibilities, and service agreements.",
    page: "terms" 
  },
  {
    icon: <Shield size={24} />,
    title: "About Swift Cause",
    description: "Learn about our mission, story, impact, and how we're transforming fundraising for organizations worldwide.",
    page: "about" 
  }
];


const UserDocCard = ({ icon, title, description, details }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  details: string[] 
}) => (
  <Dialog>
    <DialogTrigger asChild>
      <div className="group block p-6 bg-white rounded-xl border border-gray-200 shadow-sm transition-all duration-300 ease-in-out hover:shadow-2xl hover:border-indigo-300 transform hover:-translate-y-2 cursor-pointer hover:bg-gradient-to-br hover:from-white hover:to-indigo-50/30">
        <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-600 mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-indigo-700 transition-colors duration-300">{title}</h3>
        <p className="text-gray-600 text-sm mb-4 leading-relaxed">{description}</p>
        <div className="flex items-center text-sm font-semibold text-indigo-600 group-hover:text-indigo-700 transition-all duration-300">
          Read More <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
        </div>
      </div>
    </DialogTrigger>
    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white to-gray-50/50 border-0 shadow-2xl">
      <DialogHeader className="space-y-4 pb-6 border-b border-gray-100">
        <DialogTitle className="flex items-center gap-4 text-2xl font-bold text-gray-900">
          <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg">
            {icon}
          </div>
          <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            {title}
          </span>
        </DialogTitle>
      </DialogHeader>
      
      <div className="mt-6 space-y-6">
        <div className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-100">
          <p className="text-gray-700 text-base leading-relaxed font-medium">{description}</p>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-1 w-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
            <h4 className="text-lg font-bold text-gray-900">Key Features</h4>
          </div>
          
          <div className="grid gap-3">
            {details.map((detail, index) => (
              <div 
                key={index} 
                className="group/item flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all duration-300"
              >
                <div className="flex-shrink-0 mt-1">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold group-hover/item:scale-110 transition-transform duration-300">
                    {index + 1}
                  </div>
                </div>
                <div className="flex-1">
                  <span className="text-gray-700 leading-relaxed group-hover/item:text-gray-900 transition-colors duration-300">
                    {detail}
                  </span>
                </div>
                <div className="flex-shrink-0 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300">
                  <ArrowRight className="h-4 w-4 text-indigo-500" />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Ready to get started? Contact our support team for assistance.</span>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
);

const LegalDocCard = ({ icon, title, description, page, onNavigate }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  page: string;
  onNavigate?: (screen: string) => void;
}) => (
  <div 
    onClick={() => onNavigate && onNavigate(page)}
    className="group block p-6 bg-white rounded-xl border border-gray-200 shadow-sm transition-all duration-300 ease-in-out hover:shadow-2xl hover:border-indigo-300 transform hover:-translate-y-2 cursor-pointer hover:bg-gradient-to-br hover:from-white hover:to-indigo-50/30"
  >
    <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-600 mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
      {icon}
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-indigo-700 transition-colors duration-300">{title}</h3>
    <p className="text-gray-600 text-sm mb-4 leading-relaxed">{description}</p>
    <div className="flex items-center text-sm font-semibold text-indigo-600 group-hover:text-indigo-700 transition-all duration-300">
      Read More <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
    </div>
  </div>
);

export function DocumentationPage({ onNavigate }: { onNavigate?: (screen: string) => void }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9">
              <Image 
                src='/logo.png'
                height='100'
                width='100'
                alt="Swift Cause Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Swift Cause</h1>
            </div>
          </div>
          
          <Button variant="ghost" onClick={() => onNavigate && onNavigate('home')} className="flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-5 w-5 mr-2" /> Back
          </Button>
        </div>
      </div>

      <main>
     
        <section className="relative py-20 sm:py-24 bg-gradient-to-b from-indigo-50 to-gray-50 text-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
              Help Center & Documentation
            </h1>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to get started, manage your campaigns, and find answers to your questions.
            </p>
          </div>
        </section>

        <div className="py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
           
            <div>
              <div className="flex items-center mb-8">
                <BookUser className="h-8 w-8 text-indigo-600 mr-3" />
                <h2 className="text-3xl font-bold text-gray-900">User Documentation (For Nonprofits)</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userDocs.map((doc, i) => (
                  <UserDocCard key={i} icon={doc.icon} title={doc.title} description={doc.description} details={doc.details} />
                ))}
              </div>
            </div>

        
            <div>
              <div className="flex items-center mb-8">
                <FileText className="h-8 w-8 text-indigo-600 mr-3" />
                <h2 className="text-3xl font-bold text-gray-900">General & Legal Documentation</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {legalDocs.map((doc, i) => (
                  <LegalDocCard key={i} icon={doc.icon} title={doc.title} description={doc.description} page={doc.page} onNavigate={onNavigate} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer onNavigate={onNavigate} />
    </div>
  );
}