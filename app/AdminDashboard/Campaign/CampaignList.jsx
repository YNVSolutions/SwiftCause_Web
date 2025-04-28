import React, { useEffect, useState } from "react";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { app } from "../../Auth/firebase";
import CampaignCard from "./CampaignCard";

const db = getFirestore(app);

export default function CampaignList() {
  const [filter, setFilter] = useState("all");
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCampaigns = async (status) => {
    setLoading(true);
    try {
      let q;

      if (status === "all") {
        q = query(collection(db, "campaigns"));
      } else {
        q = query(collection(db, "campaigns"), where("status", "==", status));
      }

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setCampaigns(data);
    } catch (err) {
      console.error("Error fetching campaigns:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns(filter);
  }, [filter]);

  return (
    <>
      <style>
        {`
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .no-scrollbar {
            -ms-overflow-style: none; /* IE and Edge */
            scrollbar-width: none; /* Firefox */
          }
        `}
      </style>
      <div className="bg-gray-900 rounded-2xl p-6 shadow-xl border border-gray-800 h-[630px] flex flex-col">
        <h1 className="text-2xl font-bold text-white mb-4 tracking-tight">Campaigns</h1>

        <div className="flex gap-2 mb-6">
          {["all", "active", "upcoming", "completed"].map((status) => (
            <button
              key={status}
              className={`px-4 py-2 rounded-full capitalize text-sm font-medium transition-all duration-300 ease-in-out ${
                filter === status
                  ? "bg-emerald-500 text-white shadow-md"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
              onClick={() => setFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2 no-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-300 font-medium animate-pulse">Loading Campaigns...</p>
            </div>
          ) : campaigns.length === 0 ? (
            <p className="text-gray-400">No campaigns found for this filter.</p>
          ) : (
            campaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))
          )}
        </div>
      </div>
    </>
  );
}