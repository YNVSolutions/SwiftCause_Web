"use client";
import { useEffect, useState } from 'react';
import { db } from '../Auth/firebase';
import { collection, getDocs } from 'firebase/firestore';
import React from 'react';
import InfoCard from './Others/InfoCard';
import DonationTrend from './Others/DonationTrend';
import DonationDistribution from './Others/DonationDistrbution';
import TopCampaigns from './Others/TopCampaigns';
import Campaigns from './Others/Campaigns';
import NavBar from '../Components/NavBar';
import Loader from '../Components/Loader';
export default function Dashboard() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "campaigns"));
                const fetchedData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setData(fetchedData);
                setLoading(false);
            } catch (err) {
                setError(err);
                setLoading(false);
                console.error("Error fetching data:", err);
            }
        };

        fetchData();
    }, []);
    if (loading) {
        return <><Loader/></>;
    }

    if (error) {
        return <p>Error loading data: {error.message}</p>;
    }

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
                        <TopCampaigns data={data}/>
                        <Campaigns data={data} />
                    </div>
                </div>
            </div>
        </>
    );
}