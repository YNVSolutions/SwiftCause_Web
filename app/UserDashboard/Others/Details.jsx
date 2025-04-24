import React from 'react'

const Details = () => {
    return (
        <>
            <div className='flex justify-between gap-5 screen py-10 '>
                <div className='rounded-xl w-[45%] py-6 px-9 bg-gray-800 text-blue-400 text-center'>
                    <h2 className='text-4xl font-bold '>$12000+</h2>
                    <h3 className='font-medium text-gray-400'>Total Donation</h3>
                </div>
                <div className='rounded-xl w-[45%] text-center py-6 px-9 bg-gray-800 text-green-400'>
                    <h2 className='text-4xl font-bold'>30+</h2>
                    <h3 className='font-medium text-gray-400'>Donated Orginations</h3>
                </div>
                <div className='rounded-xl w-[45%] text-center py-6 px-9 bg-gray-800 text-indigo-400'>
                    <h2 className='text-4xl font-bold'>20+</h2>
                    <h3 className='font-medium text-gray-400'>Liked Campaign</h3>
                </div>
            </div>
        </>
    )
}

export default Details