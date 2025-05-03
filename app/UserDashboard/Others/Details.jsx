import React from 'react'

const Details = () => {
    return (
        <>
            <div className='flex  justify-center md:justify-around gap-5 py-10 sm:flex-row flex-col mx-5'>
                <div className='rounded-xl w-full md:w-[45%] py-6 px-9 bg-gray-800 text-blue-400 text-center'>
                    <h2 className='text-4xl font-bold'>$12000+</h2>
                    <h3 className='font-medium text-gray-400'>Total Donation</h3>
                </div>
                <div className='rounded-xl w-full md:w-[45%] py-6 px-9 bg-gray-800 text-green-400 text-center'>
                    <h2 className='text-4xl font-bold'>30+</h2>
                    <h3 className='font-medium text-gray-400'>Donated Organizations</h3>
                </div>
                <div className='rounded-xl w-full md:w-[45%] py-6 px-9 bg-gray-800 text-indigo-400 text-center'>
                    <h2 className='text-4xl font-bold'>20+</h2>
                    <h3 className='font-medium text-gray-400'>Liked Campaign</h3>
                </div>
            </div>
        </>
    )
}

export default Details