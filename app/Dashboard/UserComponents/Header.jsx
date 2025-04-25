import Link from 'next/link'
import React from 'react'

const Header = () => {
    return (
        <>
            <header>
                <div className='flex items-end justify-between text-white px-5 pt-6'>
                    <h1 className='text-xl font-medium'>Hello<br /><span className='text-3xl font-semibold'>Yash Raghuvanshi 👋</span></h1>
                    <div className='flex gap-4'>
                        <Link href='/'>
                            <button className='bg-blue-600 hover:bg-blue-700 rounded-lg px-5 py-3 text-white'>Main</button>
                        </Link>
                        <button className='bg-red-600 hover:bg-red-700 rounded-lg px-5 py-3 text-white'>Log Out</button>
                    </div>
                </div>
            </header >
        </>
    )
}

export default Header