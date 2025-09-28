import React from 'react';
import { Button } from '../ui/button';
import { ArrowLeft } from 'lucide-react';

export function AboutPage({ onNavigate }: { onNavigate?: (screen: any) => void }) {
  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center">
          <Button variant="ghost" onClick={() => onNavigate && onNavigate('home')} className="px-2">
            <ArrowLeft className="h-5 w-5 mr-2" /> Back
          </Button>
        </div>
      </div>
      <section className="py-16 bg-gradient-to-b from-indigo-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About Swift Cause</h1>
          <p className="text-lg text-gray-600 mb-8">
            We build intelligent fundraising technology that helps organizations increase impact.
          </p>
          <div className="prose max-w-none text-gray-700">
            <p>
              This is a placeholder page. Replace this content with your company story, mission,
              and values. Keep the tone consistent with your brand and highlight milestones.
            </p>
            <p>
              Use this space to showcase your commitment to transparency, security, and results.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}


