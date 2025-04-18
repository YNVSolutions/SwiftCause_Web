import Image from 'next/image';
import Link from 'next/link';

function Main() {
  return (
    <main className="bg-gray-900 pt-28 text-white h-screen">
      <section className='flex justify-around items-center gap-5'>
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
            <Link href="/LearnMore" className="inline-block text-blue-300 hover:text-blue-500 font-semibold py-3 px-6 border border-blue-300 rounded-md">
              Learn More
            </Link>
          </div>
        </section>
        <Image  src="/head_image.png" width={840} height={840} alt='header image'/>
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