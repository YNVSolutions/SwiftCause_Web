"use client";
import { useState } from "react";
import Link from "next/link";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="bg-black py-4 fixed w-full top-0 z-50 shadow-md">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-blue-500">
          Swift Cause
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/CampaignPage" className="text-white hover:text-blue-300 transition-colors">
            Campaign
          </Link>
          <Link href="/Auth" className="text-white hover:text-blue-300 transition-colors">
            Sign In
          </Link>
          <Link href="/UserDashboard" className="text-red-500 hover:text-blue-300 transition-colors">
            User Dashboard
          </Link>
          <Link href="/AdminDashboard" className="text-red-500 hover:text-blue-300 transition-colors">
            Admin Dashboard
          </Link>
          <Link href='/Payment'>
            <button className="ml-4 bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-all">
              Start Fundraising
            </button>
          </Link>
        </nav>

        <div className="md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-white text-3xl focus:outline-none"
          >
            ☰
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="fixed top-0 right-0 w-64 h-full bg-gray-900 z-50 p-6 flex flex-col space-y-6 shadow-lg transition-transform">
          <button
            onClick={() => setIsOpen(false)}
            className="text-white text-2xl self-end"
          >
            ✕
          </button>
          <Link
            href="/Page"
            onClick={() => setIsOpen(false)}
            className="text-white hover:text-blue-300 text-lg"
          >
            Campaign
          </Link>
          <Link
            href="/Auth"
            onClick={() => setIsOpen(false)}
            className="text-white hover:text-blue-300 text-lg"
          >
            Sign In
          </Link>
          <Link
            href="/UserDashboard"
            onClick={() => setIsOpen(false)}
            className="text-red-500 hover:text-blue-300 text-lg"
          >
            User Dashboard
          </Link>
          <Link
            href="/AdminDashboard"
            onClick={() => setIsOpen(false)}
            className="text-red-500 hover:text-blue-300 text-lg"
          >
            Admin Dashboard
          </Link>
          <Link href='/CreateCampaign'>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-all">
              Start Fundraising
            </button>
          </Link>
        </div>
      )}
    </header>
  );
}

export default Navbar;
