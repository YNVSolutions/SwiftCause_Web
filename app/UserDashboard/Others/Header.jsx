import React from 'react'

const Header = () => {
    return (
        <>
        
            <div className='pt-20 flex flex-col md:flex-row items-center md:items-end justify-between text-white px-5'>
                <h1 className='text-center md:text-left text-xl font-medium'>
                    Hello<br />
                    <span className='text-3xl font-semibold'>Yash Raghuvanshi 👋</span>
                </h1>
                <div className='flex gap-4 mt-4 md:mt-0'>
                    <button className='bg-red-600 hover:bg-red-700 rounded-lg px-5 py-3 text-white'>Log Out</button>
                </div>
            </div>
        </>
    )
}

export default Header