import React from 'react';
import { Button } from '../ui/button';
import { ArrowLeft } from 'lucide-react';

export function DocumentationPage({ onNavigate }: { onNavigate?: (screen: any) => void }) {
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
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Documentation</h1>
          <p className="text-lg text-gray-600 mb-8">Developer and admin guides.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {["API","Webhooks","Admin Guide"].map((t, i) => (
              <div key={i} className="border rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t}</h3>
                <p className="text-gray-600">Stub content. Replace with real docs or links.</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}


