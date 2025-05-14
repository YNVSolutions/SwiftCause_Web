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

  const percentage = Math.min(
    (campaign.collectedAmount / campaign.goalAmount) * 100,
    100
  ).toFixed(0);

  return loading ? (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-gray-300 font-medium animate-pulse">
        Loading Campaigns...
      </p>
    </div>
  ) : (
    <div className="text-white p-4 bg-gray-950">
      {/* <h1 className="text-3xl font-bold mb-4">{campaign.title}</h1> */}
      {/* Main Content */}
      <main className="p-8 w-full">
        <h1 className="text-3xl font-bold text-white mb-6 tracking-tight">
          Campaign Dashboard
        </h1>

        <div className="grid grid-cols-3 gap-6 auto-rows-min min-h-[600px]">
          <div className="col-span-1 row-span-3 p-6 bg-gray-900 rounded-2xl border border-gray-800 shadow-lg">
            <div className="flex justify-center mb-4">
              <img
                src={
                  campaign.imageUrl ||
                  "https://cdn.create.vista.com/downloads/d162ed88-d803-4856-8e5e-b0e509061370_640.jpeg"
                }
                alt={campaign.title}
                className="w-80 h-80 object-cover rounded-lg border border-gray-600 shadow-md transition-transform duration-300 hover:scale-105"
              />
            </div>

            <h2 className="text-2xl font-semibold text-white mb-2 line-clamp-2">
              {campaign.title}
            </h2>
            <p className="text-gray-300 text-sm mb-4 line-clamp-3">
              {campaign.description}
            </p>
            <div className="py-3">
              {/* Progress bar */}
              <div className="w-full bg-gray-700 h-1.5 rounded-full mb-2 relative overflow-hidden">
                <div
                  className="h-1.5 bg-emerald-500 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              {/* Amount display */}
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-1">
                  <p className="text-md font-semibold text-white">
                    £{campaign.collectedAmount.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-400">
                    /£{campaign.goalAmount.toLocaleString()}
                  </p>
                </div>
                <p className="text-md font-semibold text-emerald-400">
                  {percentage}%
                </p>
              </div>
            </div>
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