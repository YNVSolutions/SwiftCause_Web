"use client";
import React, { useEffect, useState } from "react";
import { getFirestore, collection, query, getDocs } from "firebase/firestore";
import { app } from "../Auth/firebase";
import CampaignList from "./Campaign/CampaignList.jsx";
import AmountTrendChart from "./Campaign/AmountTrendChart.jsx";
import TotalDonationsCard from "./Campaign/TotalDonationsCard.jsx";
import TodaysDonationsCard from "./Campaign/TodaysDonationsCard.jsx";
import DonationStatusPieChartCard from "./Campaign/DonationStatusPieChartCard.jsx";

const firestore = getFirestore(app);

const Page = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [donations, setDonations] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch campaigns
      const campaignQuery = query(collection(firestore, "campaigns"));
      const campaignSnapshot = await getDocs(campaignQuery);
      const campaignData = campaignSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCampaigns(campaignData);

      // Fetch donations
      const donationQuery = query(collection(firestore, "donations"));
      const donationSnapshot = await getDocs(donationQuery);
      const donationData = donationSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setDonations(donationData);
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 p-8">
      <h1 className="text-3xl font-bold text-white mb-6 tracking-tight">
        Admin Dashboard
      </h1>
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <TotalDonationsCard donations={donations} className="flex-1" />
        <TodaysDonationsCard donations={donations} className="flex-1" />
        <DonationStatusPieChartCard donations={donations} className="flex-1" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lg:col-span-1">
          <AmountTrendChart campaignId="cmp_002" />
        </div>
        <div className="lg:col-span-1">
          <CampaignList />
        </div>
      </div>
    </div>
  );
};

export default Page;