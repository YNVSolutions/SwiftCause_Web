'use client';
import { useEffect, useState } from "react";
import { getFirestore, collection, query, getDocs } from "firebase/firestore";
import { app } from "../Auth/firebase";
import CampaignList from "./Campaign/CampaignList.jsx";
import AmountTrendChart from "./Campaign/AmountTrendChart.jsx";
import TotalDonationsCard from "./Campaign/TotalDonationsCard.jsx";
import TodaysDonationsCard from "./Campaign/TodaysDonationsCard.jsx";
import TopCampaignsCard from "./Campaign/TopCampaignsCard.jsx";
import DonationDistributionBarChart from "./Campaign/DonationDistributionBarChart.jsx";
import Navbar from "../Components/NavBar";
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
    <>
      <div className="fixed top-0 left-0 w-full z-50 bg-black">
        <Navbar />
      </div>
      <div className="min-h-screen bg-gray-950 p-4 sm:p-6 md:p-8 pt-24">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6 tracking-tight text-center sm:text-left">
          Admin Dashboard
        </h1>
        <div className="grid grid-cols-1 gap-6 min-h-[600px]
                        sm:grid-cols-2
                        lg:grid-cols-3
                        auto-rows-min">
          {/* Cards Row */}
          <div className="h-[180px] sm:h-[200px]">
            <TotalDonationsCard
              donations={donations}
              currency="INR"
              className="h-full"
            />
          </div>
          <div className="h-[180px] sm:h-[200px]">
            <TodaysDonationsCard donations={donations} className="h-full" />
          </div>
          {/* Top Campaigns and Campaign List on the right for lg, below for sm/md */}
          <div className="row-span-3 lg:col-start-3 lg:row-start-1 flex flex-col gap-4">
            <TopCampaignsCard campaigns={campaigns} donations={donations} />
            <CampaignList className="flex-1" />
          </div>
          {/* Charts */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-2">
            <AmountTrendChart donations={donations} className="h-[250px] sm:h-[300px]" />
          </div>
          <div className="col-span-1 sm:col-span-2 lg:col-span-2">
            <DonationDistributionBarChart
              donations={donations}
              className="h-[250px] sm:h-[350px]"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Page;
