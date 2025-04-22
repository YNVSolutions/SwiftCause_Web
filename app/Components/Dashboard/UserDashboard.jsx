"use client";
import React from 'react'
import Header from './Others/Header'
import Details from './Others/Details'
import DonationList from './Others/DonationList'
import DonationDetails from './Others/DonationDetails'
const UserDashboard = () => {
    return (
        <>
            <div className='min-h-screen'>
                <Header />
                <Details />
                <DonationList />
                <DonationDetails/>
            </div>
        </>
    )
}

export default UserDashboard