import React from 'react'
import Header from './Others/Header'
import Details from './Others/Details'
import DonationList from './Others/DonationList'

const UserDashboard = () => {
    return (
        <>
            <div className='min-h-screen'>
                <Header />
                <Details />
                <DonationList />
            </div>
        </>
    )
}

export default UserDashboard