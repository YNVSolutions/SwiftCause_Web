"use client";
import React from 'react'
import Header from './Others/Header'
import Details from './Others/Details'
import DonationList from './Others/DonationList'
import DonationDetails from './Others/DonationDetails'
import RewardsAndBadge from './UserComponents/RewardsAndBadges'
const UserDashboard = () => {
    return (
        <>
            <div className='min-h-screen bg-black'>
                <Header />
                <Details />
                <DonationList />
                <div className='min-h-screen'>
                    <div className='lg:text-5xl md:text-3xl sm:text-2xl text-white text-center font-semibold py-4'>
                        <h1>Donation Analytics</h1>
                    </div>
                    <RewardsAndBadge />
                    <DonationDetails />
                </div>
            </div>
        </>
    )
}

export default UserDashboard