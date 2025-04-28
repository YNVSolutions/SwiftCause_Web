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
    <div className="p-6 w-1/3">
      <h1 className="text-2xl font-bold mb-4">Campaigns</h1>

      <div className="flex gap-2 mb-6">
  {["all", "active", "upcoming", "completed"].map((status) => (
    <button
      key={status}
      className={`px-4 py-2 rounded-full capitalize text-sm font-medium transition-all duration-200 ease-in-out ${
        filter === status
          ? "bg-gray-900 text-white shadow-sm"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      }`}
      onClick={() => setFilter(status)}
    >
      {status}
    </button>
  ))}
</div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : campaigns.length === 0 ? (
        <p className="text-gray-500">No campaigns found for this filter.</p>
      ) : (
        <div className="space-y-2 ">
          {campaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      )}
    </div>
  );
}
