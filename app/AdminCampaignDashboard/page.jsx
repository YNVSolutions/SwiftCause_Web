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
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { app } from "../Auth/firebase";
import AmountTrendChart from "../AdminDashboard/Campaign/AmountTrendChart";
import TotalDonationsCard from "../AdminDashboard/Campaign/TotalDonationsCard.jsx";
import TodaysDonationsCard from "../AdminDashboard/Campaign/TodaysDonationsCard.jsx";
import DonationDistributionBarChart from "../AdminDashboard/Campaign/DonationDistributionBarChart.jsx";

const db = getFirestore(app);

// Utility to format ISO dates to "Month Day, Year"
const formatDate = (isoString) => {
  if (!isoString) return "N/A";
  return new Date(isoString).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export default function AdminCampaignDashboard() {
  const searchParams = useSearchParams();
  const campaignId = searchParams.get("id");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [campaign, setCampaign] = useState({});
  const [donations, setDonations] = useState([]);

  useEffect(() => {
    const fetchCampaign = async () => {
      setLoading(true);
      try {
        let q = query(
          collection(db, "campaigns"),
          where(documentId(), "==", campaignId)
        );

        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setCampaign(data[0] || {});

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

  // Handle campaign status updates
  const updateCampaignStatus = async (status) => {
    setActionLoading(true);
    try {
      const campaignRef = doc(db, "campaigns", campaignId);
      await setDoc(campaignRef, { status }, { merge: true });
      setCampaign((prev) => ({ ...prev, status }));
      alert(`Campaign marked as ${status}`);
    } catch (err) {
      console.error(`Error updating campaign status to ${status}:`, err);
      alert("Failed to update campaign status.");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle campaign deletion
  const deleteCampaign = async () => {
    if (!window.confirm("Are you sure you want to delete this campaign?"))
      return;
    setActionLoading(true);
    try {
      const campaignRef = doc(db, "campaigns", campaignId);
      await deleteDoc(campaignRef);
      alert("Campaign deleted successfully.");
      // Optionally redirect or update UI after deletion
      window.location.href = "/admin/campaigns";
    } catch (err) {
      console.error("Error deleting campaign:", err);
      alert("Failed to delete campaign.");
    } finally {
      setActionLoading(false);
    }
  };

  const percentage =
    campaign.collectedAmount && campaign.goalAmount
      ? Math.min(
          (campaign.collectedAmount / campaign.goalAmount) * 100,
          100
        ).toFixed(0)
      : 0;

  return loading ? (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-gray-300 font-medium animate-pulse">
        Loading Campaigns...
      </p>
    </div>
  ) : (
    <div className="text-white p-4 bg-gray-950">
      {/* Main Content */}
      <main className="p-8 w-full">
        <h1 className="text-3xl font-bold text-white mb-6 tracking-tight">
          Campaign Dashboard
        </h1>

        <div className="grid grid-cols-3 gap-6 auto-rows-min min-h-[600px]">
          <div className="col-span-1 row-span-3 p-6 bg-gray-900 rounded-2xl border border-gray-800 shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex justify-center mb-6">
                <img
                  src={
                    campaign.imageUrl ||
                    "https://cdn.create.vista.com/downloads/d162ed88-d803-4856-8e5e-b0e509061370_640.jpeg"
                  }
                  alt={campaign.title || "Campaign Image"}
                  className="w-80 h-80 object-cover rounded-lg border border-gray-600 shadow-md transition-transform duration-300 hover:scale-105"
                />
              </div>

              <h2 className="text-2xl font-semibold text-white mb-3 line-clamp-2">
                {campaign.title || "Untitled Campaign"}
              </h2>
              <p className="text-gray-300 text-sm mb-4 line-clamp-4">
                {campaign.description || "No description available."}
              </p>

              {/* Tags */}
              {campaign.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {campaign.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="inline-block bg-emerald-600 text-white text-xs font-medium px-2.5 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Dates*/}
              <div className="text-sm text-gray-300 mb-6 space-y-2">
                <p>
                  <span className="font-medium">Start Date:</span>{" "}
                  {formatDate(campaign.startDate)}
                </p>
                <p>
                  <span className="font-medium">End Date:</span>{" "}
                  {formatDate(campaign.endDate)}
                </p>
                <p>
                  <span className="font-medium">Last Updated:</span>{" "}
                  {formatDate(campaign.lastUpdated)}
                </p>
                {/* {campaign.giftAidEnabled && (
                <p className="flex items-center gap-1">
                  <svg
                    className="w-4 h-4 text-emerald-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>Gift Aid Enabled</span>
                </p>
              )} */}
              </div>

              {/* Progress bar */}
              <div className="py-3">
                <div className="w-full bg-gray-700 h-3 rounded-full mb-2 relative overflow-hidden">
                  <div
                    className="h-3 bg-emerald-500 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                {/* Amount display */}
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-1">
                    <p className="text-md font-semibold text-white">
                      £{(campaign.collectedAmount || 0).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-400">
                      /£{(campaign.goalAmount || 0).toLocaleString()}
                    </p>
                  </div>
                  <p className="text-md font-semibold text-emerald-400">
                    {percentage}%
                  </p>
                </div>
              </div>
            </div>
            {/* Action Buttons */}
            <div className="flex flex-col gap-2 mt-4 mb-4">
              <a
                href="<somelink>"
                className="bg-emerald-500 text-white text-center font-medium py-2 px-4 rounded-lg hover:bg-emerald-600 transition-colors duration-200"
              >
                Edit Campaign
              </a>
              <button
                onClick={() => updateCampaignStatus("completed")}
                disabled={actionLoading || campaign.status === "completed"}
                className="bg-blue-500 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading ? "Processing..." : "Mark as Completed"}
              </button>
              <button
                onClick={() =>
                  campaign.status === "paused"
                    ? updateCampaignStatus("active")
                    : updateCampaignStatus("paused")
                }
                disabled={actionLoading}
                className="bg-yellow-500 text-white font-medium py-2 px-4 rounded-lg hover:bg-yellow-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading
                  ? "Processing..."
                  : campaign.status === "paused"
                  ? "Resume Campaign"
                  : "Pause Campaign"}
              </button>
              <button
                onClick={deleteCampaign}
                disabled={actionLoading}
                className="bg-red-500 text-white font-medium py-2 px-4 rounded-lg hover:bg-red-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading ? "Processing..." : "Delete Campaign"}
              </button>
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
