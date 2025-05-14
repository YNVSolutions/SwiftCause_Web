'use client';
import React, { useEffect, useState } from "react";
import { getFirestore, collection, query, getDocs } from "firebase/firestore";
import { app } from "../Auth/firebase";
import CampaignList from "./Campaign/CampaignList.jsx";
import AmountTrendChart from "./Campaign/AmountTrendChart.jsx";
import TotalDonationsCard from "./Campaign/TotalDonationsCard.jsx";
import TodaysDonationsCard from "./Campaign/TodaysDonationsCard.jsx";
import TopCampaignsCard from "./Campaign/TopCampaignsCard.jsx";
import DonationDistributionBarChart from "./Campaign/DonationDistributionBarChart.jsx";

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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 auto-rows-min min-h-[600px]">
        <div className="h-[200px]">
          <TotalDonationsCard
            donations={donations}
            currency="INR"
            className="h-full"
          />
        </div>
        <div className="h-[200px]">
          <TodaysDonationsCard donations={donations} className="h-full" />
        </div>

        <div className="row-span-3 col-start-3 row-start-1 flex flex-col gap-4">
          <TopCampaignsCard campaigns={campaigns} donations={donations} />
          <CampaignList className="flex-1" />
        </div>

        <div className="col-span-2">
          <AmountTrendChart donations={donations} className="h-[300px]" />
        </div>
        <div className="col-span-2">
          <DonationDistributionBarChart
            donations={donations}
            className="h-[350px]"
          />
        </div>
      </div>
    </div>
  );
};

export default Page;
