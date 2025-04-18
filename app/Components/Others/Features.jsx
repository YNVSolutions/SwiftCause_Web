import React from 'react'

const Features = () => {
    return (
        <>
            <section className="bg-black py-12" id='features'>
                <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div className="p-6 rounded-md bg-gray-800 hover:bg-gray-700 hover:scale-105 transition-transform duration-300">
                        <h3 className="font-semibold text-xl text-blue-300 mb-2">Mobile-First Payment Integration</h3>
                        <p className="text-gray-300">Secure mobile transactions via Stripe and SumUp, leveraging NFC, QR codes, and in-app card entry.</p>
                    </div>
                    <div className="p-6 rounded-md bg-gray-800 hover:bg-gray-700 hover:scale-105 transition-transform duration-300">
                        <h3 className="font-semibold text-xl text-blue-300 mb-2">Flexible Donation Modes</h3>
                        <p className="text-gray-300">Support one-time and recurring donations with an optimized mobile checkout and "tap and donate" for repeat donors.</p>
                    </div>
                    <div className="p-6 rounded-md bg-gray-800 hover:bg-gray-700 hover:scale-105 transition-transform duration-300">
                        <h3 className="font-semibold text-xl text-blue-300 mb-2">Intuitive Campaign Setup</h3>
                        <p className="text-gray-300">Wizard-driven interface for creating campaign pages with UK-specific (Gift Aid) and adaptable templates.</p>
                    </div>
                    <div className="p-6 rounded-md bg-gray-800 hover:bg-gray-700 hover:scale-105 transition-transform duration-300">
                        <h3 className="font-semibold text-xl text-blue-300 mb-2">Real-Time Fund Tracking</h3>
                        <p className="text-gray-300">Live donation feeds, progress bars, and key campaign metrics powered by Firebase.</p>
                    </div>
                    <div className="p-6 rounded-md bg-gray-800 hover:bg-gray-700 hover:scale-105 transition-transform duration-300">
                        <h3 className="font-semibold text-xl text-blue-300 mb-2">Integrated Donor Communication</h3>
                        <p className="text-gray-300">In-app notifications and automated emails for new contributions, milestones, and thank-you messages.</p>
                    </div>
                    <div className="p-6 rounded-md bg-gray-800 hover:bg-gray-700 hover:scale-105 transition-transform duration-300">
                        <h3 className="font-semibold text-xl text-blue-300 mb-2">UK-Specific Gift Aid Integration</h3>
                        <p className="text-gray-300">Automated Gift Aid processing, tax receipt generation, and compliance documentation for UK regulations.</p>
                    </div>
                </div>
            </section>
        </>
    )
}

export default Features