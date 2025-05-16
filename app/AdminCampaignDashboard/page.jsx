"use client";
import  { Suspense } from "react";

import AdminCampaignDashboard from "./AdminCampaignDashboard";


export default function Page() {

    return(
        <Suspense fallback={<div>Loading...</div>}>
            <AdminCampaignDashboard />
        </Suspense>
    );

}