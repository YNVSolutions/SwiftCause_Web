"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../Components/NavBar';
import { db } from '../Auth/firebase';
import { collection, getDocs } from 'firebase/firestore';
import Loader from '../Components/Loader';

const CampaignsPage = () => {
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
        return <><Loader /></>;
    }

    if (error) {
        return <p>Error loading data: {error.message}</p>;
    }
    return (
        <div className="bg-gray-900 text-gray-100 min-h-screen flex flex-col">
            <div className="fixed top-0 left-0 w-full z-50">
                <Navbar />
            </div>
            <div className="flex flex-1 flex-col md:flex-row pt-16">
                <aside
                    className={`
                    md:fixed md:top-16 md:left-0
                    w-full md:w-80 bg-gray-900 p-6 flex flex-col items-center z-40
                    border-b border-gray-800 md:border-b-0 md:border-r
                    md:h-[calc(100vh-4rem)]
                    md:overflow-y-auto
                `}
                    style={{ maxWidth: "100vw" }}
                >
                    <div className="hidden md:block w-full">
                        <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">Campaign Titles</h2>
                        {data.map(campaign => (
                            <div key={campaign.id} className="bg-gray-700 rounded-md p-4 flex items-center space-x-4 gap-4 mb-4">
                                <div className="relative w-12 h-12 rounded-md overflow-hidden">
                                    {/*
                                        database image calling url
                                    <img
                                        src={campaign.coverImageUrl}
                                        alt={campaign.title}
                                        className="object-cover w-12 h-12"
                                    />
                                    */}
                                    <img
                                        src='/demo5.png'
                                        alt={campaign.title}
                                        className="object-cover w-12 h-12"
                                    />
                                </div>
                                <div className="flex-grow">
                                    <h3 className="text-sm font-semibold">{campaign.title}</h3>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 w-full">
                        <a href='/UserDashboard'>
                            <button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg w-full">
                                Dashboard
                            </button>
                        </a>
                    </div>
                </aside>

                <main className="flex-1 overflow-y-auto p-6 md:p-8 pt-8 md:pt-10 md:ml-64">
                    <h1 className="text-4xl font-bold text-blue-500 mb-2 text-center">
                        Explore Campaigns
                    </h1>
                    <h2 className="text-2xl font-bold mb-10 text-center">Give freely, heart takes flight.</h2>
                    <div className="flex flex-wrap justify-center items-center gap-8">
                        <AnimatePresence>
                            {data.map((campaign) => (
                                <motion.div
                                    key={campaign.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="bg-gray-800 text-black rounded-2xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300 w-85 h-[29rem] flex flex-col"
                                >
                                    <div className="relative w-full h-48">

                                        {/*
                                        database image calling url
                                        <img
                                            src={campaign.coverImageUrl}
                                            alt={campaign.title}
                                            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                                        />
                                        */}
                                        <img
                                            src='/demo1.png'
                                            alt={campaign.title}
                                            className="object-cover w-full h-full"
                                        />
                                    </div>
                                    <div className="p-6 flex flex-col justify-between flex-1">
                                        <div>
                                            <h2 className="text-lg font-semibold text-indigo-600 mb-2">{campaign.title}</h2>
                                            <p className="text-gray-400 text-sm mb-4">{campaign.description}</p>
                                        </div>
                                        <div className="flex justify-between items-end mt-auto">
                                            <span className="inline-flex items-center bg-green-600 text-white text-md font-semibold px-3 py-1 rounded-full">
                                                Goal: £{campaign.goalAmount}
                                            </span>
                                            <button
                                                className="bg-red-600 text-white py-3 px-5 rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 text-lg"
                                            >
                                                💌 Donate
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </main>
            </div >
        </div >
    );
}

export default CampaignsPage;
