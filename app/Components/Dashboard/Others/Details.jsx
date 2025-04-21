import React from 'react'

const Details = () => {
    return (
        <>
            <div className='flex justify-between gap-5 screen py-10'>
                <div className='rounded-xl w-[45%] py-6 px-9 bg-red-400'>
                    <h2 className='text-3xl font-semibold'>0</h2>
                    <h3 className='text-xl font-medium'>New Task</h3>
                </div>
                <div className='rounded-xl w-[45%] py-6 px-9 bg-blue-400'>
                    <h2 className='text-3xl font-semibold'>0</h2>
                    <h3 className='text-xl font-medium'>New Task</h3>
                </div>
                <div className='rounded-xl w-[45%] py-6 px-9 bg-green-400'>
                    <h2 className='text-3xl font-semibold'>0</h2>
                    <h3 className='text-xl font-medium'>New Task</h3>
                </div>
            </div>
        </>
    )
}

export default Details