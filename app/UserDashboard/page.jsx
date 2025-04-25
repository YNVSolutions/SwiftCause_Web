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
                <RewardsAndBadge/>
                <DonationDetails/>
            </div>
        </>
    )
}

export default UserDashboard