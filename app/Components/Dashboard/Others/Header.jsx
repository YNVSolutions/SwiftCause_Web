import React from 'react'

const Header = () => {
    return (
        <>
            <div className='flex items-end justify-between text-white px-5 pt-6'>
                <h1 className='text-xl font-medium'>Hello<br /><span className='text-3xl font-semibold'>Yash Raghuvanshi 👋</span></h1>
                <button className='bg-red-600 rounded-lg px-5 py-3 text-white'>Log Out</button>
            </div>
        </>
    )
}

export default Header