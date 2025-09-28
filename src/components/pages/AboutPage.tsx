import React from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { ArrowLeft, Smartphone, Shield, BarChart3, QrCode, Target, UserCog, Heart, Award, Globe, CheckCircle } from 'lucide-react';
import swiftCauseLogo from '../../assets/logo.png';

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
                  src={swiftCauseLogo} 
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
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-blue-50">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-100 text-indigo-800 text-sm">
                <Heart className="w-4 h-4 mr-2" />
                Empowering organizations worldwide
              </div>
              
              <div className="space-y-6">
                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  About
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600"> Swift Cause</span>
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
                  className="h-14 px-8 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg"
                >
                  Get Started
                </Button>
              </div>
            </div>

            {/* About Section Image */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-white p-8 hover:shadow-3xl transition-all duration-500 group">
                <div className="aspect-square bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-8 flex flex-col justify-center items-center group-hover:scale-105 transition-transform duration-500">
                  <div className="w-100 h-100 mb-6 group-hover:rotate-12 transition-transform duration-500">
                    <img 
                      src="/aboutSection.png" 
                      alt="About Section" 
                      className="w-full h-full object-contain rounded-lg drop-shadow-lg"
                    />
                  </div>
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors duration-300">
                      Swift Cause
                    </h3>
                    <p className="text-gray-600 group-hover:text-indigo-500 transition-colors duration-300">
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
              <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-indigo-50 to-purple-50 p-8 hover:shadow-3xl transition-all duration-500 group">
                <div className="aspect-square bg-white rounded-xl p-8 flex flex-col justify-center items-center group-hover:scale-105 transition-transform duration-500">
                  <div className="w-100 h-100 mb-6 group-hover:rotate-12 transition-transform duration-500">
                    <img 
                      src="/ourStory.png" 
                      alt="Our Story" 
                      className="w-full h-full object-contain rounded-lg drop-shadow-lg"
                    />
                  </div>
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors duration-300">
                      Our Journey
                    </h3>
                    <p className="text-gray-600 group-hover:text-indigo-500 transition-colors duration-300">
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

      {/* What We Do Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              What We Do
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Simple tools that make fundraising effortless
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-all duration-300 group">
              <CardContent className="p-8">
                <div className="inline-flex p-4 rounded-2xl bg-blue-50 text-blue-600 border-blue-200 mb-6 group-hover:scale-110 transition-transform">
                  <Smartphone className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Easy Mobile Donations</h3>
                <p className="text-gray-600 mb-6">Turn any smartphone or tablet into a donation station. No special equipment needed - just download and start collecting.</p>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Works on any device
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    No technical setup
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Instant activation
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 group">
              <CardContent className="p-8">
                <div className="inline-flex p-4 rounded-2xl bg-green-50 text-green-600 border-green-200 mb-6 group-hover:scale-110 transition-transform">
                  <Shield className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Bank-Level Security</h3>
                <p className="text-gray-600 mb-6">Your donors' information and payments are protected with the same security used by major banks and online retailers.</p>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Secure payments
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Data protection
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Fraud protection
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 group">
              <CardContent className="p-8">
                <div className="inline-flex p-4 rounded-2xl bg-purple-50 text-purple-600 border-purple-200 mb-6 group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Real-Time Insights</h3>
                <p className="text-gray-600 mb-6">See exactly how your fundraising is performing with easy-to-understand reports and live donation tracking.</p>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Live updates
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Simple reports
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Donor insights
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 group">
              <CardContent className="p-8">
                <div className="inline-flex p-4 rounded-2xl bg-orange-50 text-orange-600 border-orange-200 mb-6 group-hover:scale-110 transition-transform">
                  <QrCode className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">QR Code Access</h3>
                <p className="text-gray-600 mb-6">Donors can simply scan a QR code with their phone to donate instantly - no app downloads required.</p>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Instant access
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    No app needed
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Easy sharing
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 group">
              <CardContent className="p-8">
                <div className="inline-flex p-4 rounded-2xl bg-indigo-50 text-indigo-600 border-indigo-200 mb-6 group-hover:scale-110 transition-transform">
                  <Target className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Campaign Management</h3>
                <p className="text-gray-600 mb-6">Create and manage multiple fundraising campaigns with custom goals, stories, and branding - all from one simple dashboard.</p>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Multiple campaigns
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Custom branding
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Goal tracking
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 group">
              <CardContent className="p-8">
                <div className="inline-flex p-4 rounded-2xl bg-red-50 text-red-600 border-red-200 mb-6 group-hover:scale-110 transition-transform">
                  <UserCog className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Team Management</h3>
                <p className="text-gray-600 mb-6">Add team members with different access levels. Perfect for organizations with multiple staff or volunteers.</p>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Multiple users
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Access control
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Easy setup
                  </li>
                </ul>
              </CardContent>
            </Card>
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
              <div className="text-4xl font-bold text-indigo-600 mb-2">500+</div>
              <div className="text-gray-600">Organizations Served</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-indigo-600 mb-2">$2M+</div>
              <div className="text-gray-600">Raised for Good Causes</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-indigo-600 mb-2">50+</div>
              <div className="text-gray-600">Countries Worldwide</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join hundreds of organizations already using Swift Cause to maximize their impact
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => onNavigate && onNavigate('signup')}
              size="lg" 
              className="h-14 px-8 bg-white text-indigo-600 hover:bg-gray-100 shadow-lg"
            >
              Start Your Free Trial
            </Button>
            <Button  
              size="lg" 
             className="h-14 px-8 bg-white text-indigo-600 hover:bg-gray-100 shadow-lg"
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
