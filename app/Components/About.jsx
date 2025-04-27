import React from 'react';
import { ArrowRight, BookOpen, Code, Heart, HelpCircle, Users, Zap } from 'lucide-react';
const About = () => {
    return (
        <>
            <div className="bg-black flex flex-col">
                <header className="py-6 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto text-center">
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
                            Learn More About Swift Cause
                        </h1>
                        <p className="mt-4 text-lg sm:text-xl text-gray-200 max-w-2xl mx-auto">
                            Empowering nonprofits with modern, mobile-first fundraising tools.
                        </p>
                    </div>
                </header>
                <section className="bg-white/5 backdrop-blur-md rounded-xl p-6 sm:p-8 border border-blue-500/20 shadow-lg">
                    <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-4 flex items-center">
                        <BookOpen className="mr-2 w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
                        Our Vision
                    </h2>
                    <p className="text-gray-200 text-base sm:text-lg leading-relaxed">
                        At Swift Cause, we believe in the power of collective action. Our platform bridges the gap
                        between passionate individuals and the impactful causes they support. We strive to create a
                        seamless and trustworthy experience for both donors and nonprofits, fostering a stronger
                        sense of community and driving meaningful change.
                    </p>
                </section>
            </div>
        </>
    )
}

export default About