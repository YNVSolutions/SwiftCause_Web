import Link from 'next/link';

function Main() {
  return (
    <main className="bg-gray-900 py-16 text-white">
      <section className="container mx-auto text-center mb-16">
        <h1 className="text-4xl font-bold text-blue-500 mb-6">
          Modern Donation Platform for Nonprofits
        </h1>
        <p className="text-lg text-gray-300 mb-8">
          Launch, manage, and scale your fundraising campaigns with Swift Cause.
          Built for nonprofits with a focus on mobile-first experiences and global reach.
        </p>
        <div className="flex justify-center space-x-4">
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-md focus:outline-none focus:shadow-outline">
            Create a Campaign
          </button>
          <Link href="/" className="inline-block text-blue-300 hover:text-blue-500 font-semibold py-3 px-6 border border-blue-300 rounded-md">
            Learn More
          </Link>
        </div>
      </section>

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
      <section className="py-12">
          <div className="container mx-auto text-center">
            <h2 className="text-2xl font-bold mb-6  text-blue-500">Our Impact</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 rounded-md bg-gray-800">
                <span className="text-3xl font-bold text-blue-400">₹XX Crore+</span>
                <p className="text-gray-400">Raised So Far</p>
              </div>
              <div className="p-6 rounded-md bg-gray-800">
                <span className="text-3xl font-bold text-green-400">YY Lakh+</span>
                <p className="text-gray-400">Lives Impacted</p>
              </div>
              <div className="p-6 rounded-md bg-gray-800">
                <span className="text-3xl font-bold text-indigo-400">ZZK+</span>
                <p className="text-gray-400">Fundraisers Hosted</p>
              </div>
            </div>
          </div>
        </section>
    </main>
  );
}

export default Main;