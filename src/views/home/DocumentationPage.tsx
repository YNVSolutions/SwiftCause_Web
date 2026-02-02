import React from 'react';
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
  ArrowRight
} from 'lucide-react';


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

const UserDocCard = ({ icon, title, description, details }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  details: string[] 
}) => (
  <Dialog>
    <DialogTrigger asChild>
      <div className="group block p-8 bg-[#F7F6F2] rounded-[2rem] border border-[#F3F1EA]/60 shadow-lg shadow-slate-200/20 transition-all duration-300 ease-in-out hover:shadow-xl hover:shadow-slate-200/30 transform hover:-translate-y-2 cursor-pointer hover:bg-[#F3F1EA]/50">
        <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-[#064e3b]/10 text-[#064e3b] mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
          {icon}
        </div>
        <h3 className="text-lg font-medium text-slate-800 mb-3 group-hover:text-[#064e3b] transition-colors duration-300 tracking-tight">{title}</h3>
        <p className="text-slate-600 text-sm mb-4 leading-relaxed font-normal tracking-wide">{description}</p>
        <div className="flex items-center text-sm font-medium text-[#064e3b] group-hover:text-[#064e3b] transition-all duration-300 tracking-wide">
          Read More <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
        </div>
      </div>
    </DialogTrigger>
    <DialogContent className="no-scrollbar scrollbar-none max-w-4xl w-[90vw] h-[85vh] bg-[#F7F6F2] border-0 shadow-2xl rounded-[2rem] p-0 overflow-y-auto [&>button]:hidden">
      <div className="flex flex-col">
        <DialogHeader className="flex-shrink-0 p-8 pb-6 border-b border-slate-200/50">
          <DialogTitle className="flex items-center gap-4 text-2xl font-medium text-slate-800 tracking-tight">
            <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-[#064e3b]/10 text-[#064e3b] shadow-lg">
              {icon}
            </div>
            <span className="text-slate-800">
              {title}
            </span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="p-8 pt-6">
          <div className="flex flex-col space-y-6">
            <div className="flex-shrink-0 p-4 bg-[#064e3b]/5 rounded-2xl border border-[#064e3b]/10">
              <p className="text-slate-700 text-base leading-relaxed font-normal tracking-wide">{description}</p>
            </div>
            
            <div className="flex-1 min-h-0 flex flex-col">
              <div className="flex-shrink-0 flex items-center gap-2 mb-4">
                <div className="h-1 w-8 bg-[#064e3b] rounded-full"></div>
                <h4 className="text-lg font-medium text-slate-800 tracking-tight">Key Features</h4>
              </div>
              
              <div className="flex-1 min-h-0">
                <div className="grid grid-cols-1 gap-3 content-start">
                  {details.map((detail, index) => (
                    <div 
                      key={index} 
                      className="group/item flex items-start gap-3 p-4 bg-[#F3F1EA] rounded-2xl border border-slate-200/50 hover:border-[#064e3b]/20 hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-6 h-6 rounded-full bg-[#064e3b] flex items-center justify-center text-white text-xs font-semibold group-hover/item:scale-110 transition-transform duration-300">
                          {index + 1}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-slate-700 leading-relaxed group-hover/item:text-slate-800 transition-colors duration-300 font-normal text-sm tracking-wide">
                          {detail}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
);

export function DocumentationPage({ onNavigate, onBack }: { onNavigate?: (screen: string) => void; onBack?: () => void }) {
  return (
    <div className="min-h-screen bg-[#F3F1EA] font-['Helvetica',sans-serif] text-slate-700 antialiased">
      <style jsx>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
        .no-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        * {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
        }
      `}</style>
      
      {/* Header */}
      <nav className="fixed top-0 w-full z-50">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between py-5 glass-card px-4 rounded-b-2xl">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="SwiftCause" className="w-8 h-8" />
            <span className="font-bold text-xl tracking-tight text-[#064e3b]">SwiftCause</span>
          </div>
          
          <Button 
            variant="ghost" 
            onClick={() => (onBack ? onBack() : onNavigate && onNavigate('home'))} 
            className="flex items-center gap-2 text-[#064e3b] border border-[#064e3b] px-4 py-2 rounded-2xl hover:bg-[#064e3b] hover:text-stone-50 transition-all duration-300"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-semibold">Back</span>
          </Button>
        </div>
      </nav>

      <main className="pt-32">
        {/* Hero Section */}
        <section className="pb-8 px-4">
          <div className="max-w-[1400px] mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-medium text-slate-800 leading-tight mb-6 tracking-tight">
              Help Center & Documentation
            </h1>
            <p className="text-slate-600 text-lg leading-relaxed font-normal max-w-3xl mx-auto tracking-wide">
              Everything you need to get started, manage your campaigns, and find answers to your questions.
            </p>
          </div>
        </section>

        {/* Content Sections */}
        <div className="px-4 pb-12">
          <div className="max-w-[1400px] mx-auto space-y-12">
           
            {/* User Documentation Section */}
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {userDocs.map((doc, i) => (
                  <UserDocCard key={i} icon={doc.icon} title={doc.title} description={doc.description} details={doc.details} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
