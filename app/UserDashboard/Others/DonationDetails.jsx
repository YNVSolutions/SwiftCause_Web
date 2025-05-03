import React from 'react'
import DonationGraph from './DonationGraph'

const DonationDetails = () => {
    return (
        <>
            <div className='flex flex-wrap md:flex-nowrap justify-between gap-3'>
                <div className='w-full md:w-1/2'>
                    <DonationGraph />
                </div>
                <div className='w-full md:w-1/2 text-white mt-8'>
                    <h1 className='text-3xl font-bold text-center'>The Donation Analytics</h1>
                    <p className='font-medium mt-5 text-gray-300'>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Explicabo incidunt fugiat laboriosam iusto amet. Repellendus perspiciatis ab cupiditate ducimus quos quis consequatur exercitationem architecto!</p>
                    <div className='flex justify-center items-center gap-5 mt-5'>
                        <button className='bg-green-600 text-sm px-3 py-2 rounded hover:bg-green-800'>Monthly</button>
                        <button className='bg-blue-600 text-sm px-3 py-2 rounded hover:bg-blue-800'>Yearly</button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default DonationDetails