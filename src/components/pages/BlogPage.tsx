import React from 'react';
import { Button } from '../ui/button';
import { ArrowLeft } from 'lucide-react';
import { Footer } from '../shared/Footer';
import swiftCauseLogo from '../../assets/logo.png';

export function BlogPage({ onNavigate }: { onNavigate?: (screen: any) => void }) {
  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8">
              <img 
                src={swiftCauseLogo} 
                alt="Swift Cause Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Swift Cause</h1>
              <p className="text-xs text-gray-600">Donation Platform</p>
            </div>
          </div>
          
          <Button variant="ghost" onClick={() => onNavigate && onNavigate('home')} className="px-2">
            <ArrowLeft className="h-5 w-5 mr-2" /> Back
          </Button>
        </div>
      </div>
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Blog</h1>
          <p className="text-lg text-gray-600 mb-8">Insights, product updates, and stories from Swift Cause.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1,2,3,4].map((i) => (
              <div key={i} className="border rounded-xl p-6 hover:shadow-md transition">
                <div className="text-sm text-indigo-600 mb-2">Category</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Sample blog post title {i}</h3>
                <p className="text-gray-600 mb-4">This is placeholder copy. Replace with your actual article summaries.</p>
                <button className="text-indigo-600 hover:text-indigo-700 font-medium">Read more →</button>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      <Footer onNavigate={onNavigate} />
    </div>
  );
}


