import React from 'react';
import { Button } from '../ui/button';
import { ArrowLeft } from 'lucide-react';

export function ContactPage({ onNavigate }: { onNavigate?: (screen: any) => void }) {
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
          <p className="text-lg text-gray-600 mb-8">We'd love to hear from you. This is placeholder content.</p>
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input className="border rounded-md px-4 py-3" placeholder="Name" />
              <input className="border rounded-md px-4 py-3" placeholder="Email" />
            </div>
            <input className="border rounded-md px-4 py-3 w-full" placeholder="Subject" />
            <textarea className="border rounded-md px-4 py-3 w-full h-32" placeholder="Message" />
            <button type="button" className="px-6 py-3 rounded-md bg-indigo-600 text-white hover:bg-indigo-700">Send</button>
          </form>
        </div>
      </section>
    </div>
  );
}


