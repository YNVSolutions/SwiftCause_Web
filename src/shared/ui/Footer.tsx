import React from 'react';
import { Clock, Mail, MapPin, Phone, Heart, Github, Twitter, Linkedin, Shield, Award, TrendingUp } from 'lucide-react';
import swiftCauseLogo from '../assets/logo.png';

interface FooterProps {
  onNavigate?: (screen: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-green-600 rounded-full filter blur-3xl opacity-5"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-600 rounded-full filter blur-3xl opacity-5"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 relative">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
          
          {/* Brand Section */}
          <div className="space-y-6 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-green-600 rounded-lg p-2">
                <img 
                  src={swiftCauseLogo} 
                  alt="Swift Cause Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="text-xl font-bold">Swift Cause</span>
                <p className="text-xs text-gray-400">Donation Platform</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Empowering organizations to create meaningful impact through intelligent fundraising technology and seamless donation experiences.
            </p>
            
            {/* Trust Badges */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center space-x-2 px-3 py-2 bg-gray-800 rounded-lg border border-gray-700">
                <Shield className="w-4 h-4 text-green-500" />
                <span className="text-xs text-gray-300">PCI Compliant</span>
              </div>
              <div className="flex items-center space-x-2 px-3 py-2 bg-gray-800 rounded-lg border border-gray-700">
                <Award className="w-4 h-4 text-green-500" />
                <span className="text-xs text-gray-300">ISO Certified</span>
              </div>
            </div>
          </div>
          
          {/* Company Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4 text-white flex items-center">
              <div className="w-1 h-6 bg-green-600 rounded-full mr-3"></div>
              Company
            </h4>
            <ul className="space-y-3">
              {[
                { label: 'About Us', path: 'about' },
                { label: 'Contact', path: 'contact' },
                { label: 'Careers', path: 'careers' },
                { label: 'Press Kit', path: 'press' }
              ].map((item) => (
                <li key={item.path}>
                  <button 
                    onClick={() => onNavigate && onNavigate(item.path)} 
                    className="text-gray-400 hover:text-green-400 transition-colors text-sm flex items-center group"
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-green-400 mr-0 group-hover:mr-2 transition-all duration-200"></span>
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Resources Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4 text-white flex items-center">
              <div className="w-1 h-6 bg-green-600 rounded-full mr-3"></div>
              Resources
            </h4>
            <ul className="space-y-3">
              {[
                { label: 'Documentation', path: 'docs' },
                { label: 'API Reference', path: 'api' },
                { label: 'Help Center', path: 'help' },
                { label: 'Terms of Service', path: 'terms' }
              ].map((item) => (
                <li key={item.path}>
                  <button 
                    onClick={() => onNavigate && onNavigate(item.path)} 
                    className="text-gray-400 hover:text-green-400 transition-colors text-sm flex items-center group"
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-green-400 mr-0 group-hover:mr-2 transition-all duration-200"></span>
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Contact & Newsletter */}
          <div>
            <h4 className="font-semibold text-lg mb-4 text-white flex items-center">
              <div className="w-1 h-6 bg-green-600 rounded-full mr-3"></div>
              Get in Touch
            </h4>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start space-x-3 text-gray-400 text-sm">
                <Mail className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>support@swiftcause.org</span>
              </li>
              <li className="flex items-start space-x-3 text-gray-400 text-sm">
                <Phone className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>+44 20 1234 5678</span>
              </li>
              <li className="flex items-start space-x-3 text-gray-400 text-sm">
                <MapPin className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>London, United Kingdom</span>
              </li>
            </ul>
            
            {/* Social Links */}
            <div className="flex space-x-3">
              {[
                { icon: Twitter, label: 'Twitter' },
                { icon: Linkedin, label: 'LinkedIn' },
                { icon: Github, label: 'GitHub' }
              ].map((social) => (
                <button
                  key={social.label}
                  className="w-10 h-10 bg-gray-800 hover:bg-green-600 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110 group border border-gray-700 hover:border-green-500"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Newsletter Section */}
        <div className="border-t border-gray-800 pt-8 mb-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-600/10 border border-green-600/20 text-green-400 text-sm font-medium mb-4">
              <Heart className="w-4 h-4 mr-2" />
              Stay Updated
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Subscribe to Our Newsletter</h3>
            <p className="text-gray-400 text-sm mb-6">Get the latest updates on features, tips, and success stories.</p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors"
              />
              <button className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-green-600/50">
                Subscribe
              </button>
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 text-sm">© 2025 Swift Cause. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <div className="flex items-center space-x-2 text-gray-400">
              <Clock className="w-4 h-4 text-green-500" />
              <span className="text-sm">24/7 Support</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-400">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm">99.9% Uptime</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
