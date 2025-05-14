"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  getFirestore,
  doc,
  getDocs,
  query,
  where,
  collection,
  documentId,
} from "firebase/firestore";
import { app } from "../Auth/firebase";
import AmountTrendChart from "../AdminDashboard/Campaign/AmountTrendChart";
import TotalDonationsCard from "../AdminDashboard/Campaign/TotalDonationsCard.jsx";
import TodaysDonationsCard from "../AdminDashboard/Campaign/TodaysDonationsCard.jsx";
import DonationDistributionBarChart from "../AdminDashboard/Campaign/DonationDistributionBarChart.jsx";

const db = getFirestore(app);

export default function AdminCampaignDashboard() {
  const searchParams = useSearchParams();
  const campaignId = searchParams.get("id");
  const [loading, setLoading] = useState(true);

  const [campaign, setCampaign] = useState([]);
  const [donations, setDonations] = useState([]);

  useEffect(() => {
    const fetchCampaign = async (status) => {
      setLoading(true);
      try {
        let q;
        q = query(
          collection(db, "campaigns"),
          where(documentId(), "==", campaignId)
        );

        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setCampaign(data[0]);

        const donationQuery = query(collection(db, "donations"));
        const donationSnapshot = await getDocs(donationQuery);
        const donationData = donationSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDonations(donationData);
      } catch (err) {
        console.error("Error fetching campaigns:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaign();
  }, [campaignId]);
  return loading ? (
    <div className="flex flex-col items-center justify-center h-full ">
      <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-gray-300 font-medium animate-pulse">
        Loading Campaigns...
      </p>
    </div>
  ) : (
    <div className="text-white p-4 bg-gray-950">
      <h1 className="text-3xl font-bold mb-4">{campaign.title}</h1>
      {/* Main Content */}
      <main className="p-8 w-full">
        <h1 className="text-3xl font-bold text-white mb-6 tracking-tight">
          Campaign Dashboard
        </h1>

        <div className="grid grid-cols-3  gap-6 auto-rows-min min-h-[600px]">
          <div className="col-span-1 row-span-3 p-6">
            <div className="flex justify-center">
              <img
                src={
                  campaign.imageUrl || "https://cdn.create.vista.com/downloads/d162ed88-d803-4856-8e5e-b0e509061370_640.jpeg"
                }
                alt={campaign.title}
                className="w-80 h-80 object-cover rounded-lg border border-gray-700"
              />
            </div>

            <p className="text-white">{campaign.title}</p>
            <p>{campaign.description}</p>
          </div>
          <div className="h-[200px] col-span-1">
            <TotalDonationsCard
              donations={donations}
              campaignId={campaignId}
              currency="INR"
              className="h-full"
            />
          </div>
          <div className="h-[200px] col-span-1">
            <TodaysDonationsCard donations={donations} className="h-full" />
          </div>
          <div className="col-span-2">
            <AmountTrendChart
              donations={donations}
              campaignId={campaignId}
              className="h-[300px]"
            />
          </div>
          <div className="col-span-2">
            <DonationDistributionBarChart
              donations={donations}
              campaignId={campaignId}
              className="h-[350px]"
            />
          </div>
        </div>
      </main>
    </div>
  );
}
