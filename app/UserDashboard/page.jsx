"use client";
import React from 'react'
import Header from './Others/Header'
import Details from './Others/Details'
import DonationList from './Others/DonationList'
import DonationDetails from './Others/DonationDetails'
import RewardsAndBadge from './Others/RewardsAndBadges'
import Navbar from '../Components/NavBar'
const UserDashboard = () => {
    return (
        <>
            <div className='min-h-screen bg-black'>
                <div className="fixed top-0 left-0 w-full z-50 bg-black">
                    <Navbar />
                </div>
                <Header />
                <Details />
                <DonationList />
                <div className='min-h-screen'>
                    <div className='text-5xl lg:text-5xl md:text-4xl sm:text-2xl text-white text-center font-semibold py-4'>
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