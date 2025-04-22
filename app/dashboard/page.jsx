"use client";
import React from "react";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { app } from "../Components/Auth/firebase.tsx";
import CampaignList from "../Campaign/CampaignList.jsx";

const firestore = getFirestore(app);

const Page = () => {
  

  return (
    <div className="p-6 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <CampaignList />
    </div>
  );
};

export default Page;
