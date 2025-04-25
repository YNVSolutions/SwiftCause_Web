"use client";
import React from 'react'
import Header from './UserComponents/Header';
import DontionDetails from './UserComponents/DontionDetails';
import DonationHistory from './UserComponents/DonationHistory';
import DonationAnalytics from './UserComponents/DonationAnalytics';
import RewardsAndBadges from './UserComponents/RewardsAndBadges';
const UserDashboard = () => {
    return (
        <>
            <div className='min-h-screen bg-black'>
                <Header />
                <DontionDetails />
                <DonationHistory />
                <div className='w-full min-h-screen mt-4'>
                    <div className='lg:text-5xl sm:text-2xl md:text-4xl text-gray-300 text-center font-semibold py-4'>
                        <h1>Donation Analytics</h1>
                    </div>
                    <RewardsAndBadges />
                    <DonationAnalytics />
                </div>
            </div >
        </>
    )
}

export default UserDashboard