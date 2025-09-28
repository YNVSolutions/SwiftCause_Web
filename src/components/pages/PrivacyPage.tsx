import React from 'react';
import { Button } from '../ui/button';
import { ArrowLeft } from 'lucide-react';

export function PrivacyPage({ onNavigate }: { onNavigate?: (screen: any) => void }) {
  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center">
          <Button variant="ghost" onClick={() => onNavigate && onNavigate('home')} className="px-2">
            <ArrowLeft className="h-5 w-5 mr-2" /> Back
          </Button>
        </div>
      </div>
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-lg text-gray-600 mb-8">This is placeholder content. Replace with your privacy policy.</p>
          <div className="prose max-w-none text-gray-700">
            <p>We respect your privacy and are committed to protecting your data.</p>
            <p>Describe what data you collect, how you use it, and user rights.</p>
          </div>
        </div>
      </section>
    </div>
  );
}


