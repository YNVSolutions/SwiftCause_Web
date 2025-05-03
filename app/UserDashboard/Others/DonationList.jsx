import React from 'react'

const DonationList = () => {
    return (
        <>
            <header className='flex justify-center items-center w-full pt-5'>
                <h1 className='text-4xl lg:text-4xl md:text-3xl sm:text-2xl font-semibold text-white'>Donation History</h1>
            </header>
            <div id='tasklist' className='h-auto md:h-[55%] flex flex-wrap md:flex-nowrap items-center justify-center md:justify-start gap-5 py-5 mt-10 overflow-x-auto text-gray-100'>
                <div className='flex-shrink-0 w-full md:w-[300px] bg-gray-800 rounded-xl py-5 px-5'>
                    <div className='flex justify-between items-center'>
                        <h2 className='bg-green-600 text-sm px-3 py-1 rounded'>$2200</h2>
                        <h2 className='text-sm'>20 April 2025</h2>
                    </div>
                    <h2 className='text-2xl font-semibold mt-5 text-indigo-400'>XYZ Organization</h2>
                </div>
                <div className='flex-shrink-0 w-full md:w-[300px] bg-gray-800 rounded-xl py-5 px-5'>
                    <div className='flex justify-between items-center'>
                        <h2 className='bg-green-600 text-sm px-3 py-1 rounded'>$4800</h2>
                        <h2 className='text-sm'>20 April 2025</h2>
                    </div>
                    <h2 className='text-2xl font-semibold mt-5 text-blue-400'>XYZ Organization</h2>
                </div>
                <div className='flex-shrink-0 w-full md:w-[300px] bg-gray-800 rounded-xl py-5 px-5'>
                    <div className='flex justify-between items-center'>
                        <h2 className='bg-green-600 text-sm px-3 py-1 rounded'>$2000</h2>
                        <h2 className='text-sm'>20 April 2025</h2>
                    </div>
                    <h2 className='text-2xl font-semibold mt-5 text-green-400'>XYZ Organization</h2>
                </div>
                <div className='flex-shrink-0 w-full md:w-[300px] bg-gray-800 rounded-xl py-5 px-5'>
                    <div className='flex justify-between items-center'>
                        <h2 className='bg-green-600 text-sm px-3 py-1 rounded'>$1900</h2>
                        <h2 className='text-sm'>20 April 2025</h2>
                    </div>
                    <h2 className='text-2xl font-semibold mt-5 text-indigo-400'>XYZ Organization</h2>
                </div>
                <div className='flex-shrink-0 w-full md:w-[300px] bg-gray-800 rounded-xl py-5 px-5'>
                    <div className='flex justify-between items-center'>
                        <h2 className='bg-green-600 text-sm px-3 py-1 rounded'>$2000</h2>
                        <h2 className='text-sm'>20 April 2025</h2>
                    </div>
                    <h2 className='text-2xl font-semibold mt-5 text-blue-400'>XYZ Organization</h2>
                </div>
                <div className='flex-shrink-0 w-full md:w-[300px] bg-gray-800 rounded-xl py-5 px-5'>
                    <div className='flex justify-between items-center'>
                        <h2 className='bg-green-600 text-sm px-3 py-1 rounded'>$1500</h2>
                        <h2 className='text-sm'>20 April 2025</h2>
                    </div>
                    <h2 className='text-2xl font-semibold mt-5 text-green-400'>XYZ Organization</h2>
                </div>
            </div>
        </>
    )
}

export default DonationList