import React from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Footer = () => {
    return (
        <>
            <footer className="bg-gray-900 text-white py-8">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <p className="text-sm text-gray-400 mb-4 md:mb-0">
                            &copy; {new Date().getFullYear()} YNV Solutions. All rights reserved.
                        </p>
                        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
                            <a href="/" className="text-blue-300 hover:text-blue-400 transition-colors">Privacy Policy</a>
                            <span className="text-gray-700 hidden md:inline">|</span>
                            <a href="/" className="text-blue-300 hover:text-blue-400 transition-colors">Terms of Service fluff off</a>
                            <span className="text-gray-700 hidden md:inline">|</span>
                            <a href="/" className="text-blue-300 hover:text-blue-400 transition-colors">Contact Us</a>
                        </div>
                        <div className="mt-4 md:mt-0 flex space-x-4">
                            <a href="#" aria-label="Facebook" className="text-gray-400 hover:text-blue-400 transition-colors">
                                <i className="fab fa-facebook text-lg"></i>
                            </a>
                            <a href="#" aria-label="Twitter" className="text-gray-400 hover:text-blue-400 transition-colors">
                                <i className="fab fa-twitter text-lg"></i>
                            </a>
                            <a href="#" aria-label="Instagram" className="text-gray-400 hover:text-blue-400 transition-colors">
                                <i className="fab fa-instagram text-lg"></i>
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    );
};

export default Footer;