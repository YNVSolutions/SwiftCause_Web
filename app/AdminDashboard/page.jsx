"use client";
import React from "react";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { app } from "../Components/Auth/firebase";
import CampaignList from "./Campaign/CampaignList.jsx";
import AmountTrendChart from "./Campaign/AmountTrendChart.jsx";

const firestore = getFirestore(app);

const Page = () => {
  return (
    <div className="p-6 bg-gray-200">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <div className="flex">
        <AmountTrendChart campaignId="cmp_002" />
        <CampaignList />
      </div>
    </div>
  );
};

export default Page;
