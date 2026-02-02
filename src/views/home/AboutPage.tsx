"use client";
import { Button } from '../../shared/ui/button';
import { Card, CardContent } from '../../shared/ui/card';
import { ArrowLeft, Smartphone, Shield, BarChart3, QrCode, Target, UserCog, Heart, Award, Globe, CheckCircle } from 'lucide-react';


export function AboutPage({ onNavigate }: { onNavigate?: (screen: string) => void }) {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10">
                <img 
                  src="/logo.png" 
                  alt="Swift Cause Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Swift Cause</h1>
                <p className="text-xs text-gray-600">Donation Platform</p>
              </div>
            </div>
            
            <Button variant="ghost" onClick={() => onNavigate && onNavigate('home')} className="flex items-center text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5 mr-2" /> Back to Home
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                <Heart className="w-4 h-4 mr-2" />
                Empowering organizations worldwide
              </div>
              
              <div className="space-y-6">
                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  About
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600"> Swift Cause</span>
                </h1>
                
                <p className="text-xl text-gray-600 leading-relaxed">
                  We're on a mission to transform fundraising by making it simple, secure, and accessible for organizations of all sizes. 
                  No technical expertise required.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={() => onNavigate && onNavigate('signup')}
                  size="lg" 
                  className="h-14 px-8 bg-green-600 hover:bg-green-700 text-white shadow-lg"
                >
                  Get Started
                </Button>
              </div>
            </div>

            {/* About Section Image */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-white p-8 hover:shadow-3xl transition-all duration-500 group">
                <div className="aspect-square bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-8 flex flex-col justify-center items-center group-hover:scale-105 transition-transform duration-500">
                  <div className="w-100 h-100 mb-6 group-hover:rotate-12 transition-transform duration-500">
                    <img 
                      src="/aboutSection.png" 
                      alt="About Section" 
                      className="w-full h-full object-contain rounded-lg drop-shadow-lg"
                    />
                  </div>
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors duration-300">
                      Swift Cause
                    </h3>
                    <p className="text-gray-600 group-hover:text-green-500 transition-colors duration-300">
                      Donation Platform
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Our Story Section Image */}
            <div className="relative order-2 lg:order-1">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-green-50 to-emerald-50 p-8 hover:shadow-3xl transition-all duration-500 group">
                <div className="aspect-square bg-white rounded-xl p-8 flex flex-col justify-center items-center group-hover:scale-105 transition-transform duration-500">
                  <div className="w-100 h-100 mb-6 group-hover:rotate-12 transition-transform duration-500">
                    <img 
                      src="/ourStory.png" 
                      alt="Our Story" 
                      className="w-full h-full object-contain rounded-lg drop-shadow-lg"
                    />
                  </div>
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors duration-300">
                      Our Journey
                    </h3>
                    <p className="text-gray-600 group-hover:text-green-500 transition-colors duration-300">
                      Making fundraising accessible
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Story Content */}
            <div className="space-y-8 order-1 lg:order-2">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                  Our Story
                </h2>
                <p className="text-xl text-gray-600 mb-8">
                  Born from a simple idea: fundraising should be easy for everyone
                </p>
              </div>
              
              <div className="prose max-w-none text-lg text-gray-700">
                <p className="mb-6">
                  We noticed that many organizations struggle with outdated, expensive fundraising systems that require technical expertise to set up and maintain. 
                  Small charities especially face barriers with complex software and costly hardware requirements.
                </p>
                <p className="mb-6">
                  Swift Cause was created to change that. We built a platform that works on any smartphone or tablet - no special equipment needed. 
                  Our goal is to make powerful fundraising tools accessible to every organization, regardless of their size or technical knowledge.
                </p>
                <p>
                  Today, we help hundreds of organizations around the world collect donations more effectively, 
                  track their impact in real-time, and focus on what matters most - their cause.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Impact Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Our Impact
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            Helping organizations make a real difference
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">500+</div>
              <div className="text-gray-600">Organizations Served</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">£2M+</div>
              <div className="text-gray-600">Raised for Good Causes</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">50+</div>
              <div className="text-gray-600">Countries Worldwide</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-emerald-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Join hundreds of organizations already using Swift Cause to maximize their impact
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => onNavigate && onNavigate('signup')}
              size="lg" 
              className="h-14 px-8 bg-white text-green-600 hover:bg-green-50 shadow-lg font-semibold"
            >
              Start Your Free Trial
            </Button>
            <Button  
              size="lg" 
             className="h-14 px-8 bg-transparent border-2 border-white text-white hover:bg-white hover:text-green-700 shadow-lg"
              onClick={() => onNavigate && onNavigate('contact')}
            >
              Contact Us
            </Button>
          </div>
        </div>
      </section>
      
    </div>
  );
}
