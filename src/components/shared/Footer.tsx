import React from 'react';
import { Clock } from 'lucide-react';
import swiftCauseLogo from '../../assets/logo.png';

interface FooterProps {
  onNavigate?: (screen: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8">
                <img 
                  src={swiftCauseLogo} 
                  alt="Swift Cause Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-lg font-semibold">Swift Cause</span>
            </div>
            <p className="text-gray-400 text-sm">
              Empowering organizations to create meaningful impact through intelligent fundraising technology.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#solutions" className="hover:text-white transition-colors">Solutions</a></li>
              <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <button 
                  onClick={() => onNavigate && onNavigate('about')} 
                  className="hover:text-white transition-colors text-left"
                >
                  About
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate && onNavigate('blog')} 
                  className="hover:text-white transition-colors text-left"
                >
                  Blog
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate && onNavigate('contact')} 
                  className="hover:text-white transition-colors text-left"
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <button 
                  onClick={() => onNavigate && onNavigate('docs')} 
                  className="hover:text-white transition-colors text-left"
                >
                  Documentation
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate && onNavigate('terms')} 
                  className="hover:text-white transition-colors text-left"
                >
                  Terms
                </button>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-400">© 2025 Swift Cause. All rights reserved.</p>
          <div className="flex items-center space-x-2 text-gray-400">
            <Clock className="w-4 h-4" />
            <span className="text-sm">24/7 Support</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
