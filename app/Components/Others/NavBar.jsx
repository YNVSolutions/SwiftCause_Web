import Link from 'next/link';

function Navbar() {
  return (
    <header className="bg-black py-6 fixed w-full z-999">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-blue-500">
          Swift Cause
        </Link>
        <nav className="space-x-6">
          <Link href="/" className="text-white hover:text-blue-300">Features</Link>
          <Link href="/" className="text-white hover:text-blue-300">Pricing</Link>
          <Link href="/" className="text-white hover:text-blue-300">Contact</Link>
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
            Start Fundraising
          </button>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;