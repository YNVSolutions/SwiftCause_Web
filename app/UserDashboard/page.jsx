"use client";
import React from 'react';
import InfoCard from './Others/InfoCard';
import DonationTrend from './Others/DonationTrend';
import DonationDistribution from './Others/DonationDistrbution';
import TopCampaigns from './Others/TopCampaigns';
import Campaigns from './Others/Campaigns';
import NavBar from '../Components/NavBar';

export default function Dashboard() {
    return (
        <>
            <NavBar />
            <div className="bg-black text-white min-h-screen p-6 md:p-10 mt-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="space-y-6 lg:col-span-2">
                        <InfoCard />
                        <DonationTrend />
                        <DonationDistribution />
                    </div>
                    <div className="space-y-6">
                        <TopCampaigns />
                        <Campaigns />
                    </div>
                </div>
            </div>
        </>
    );
}