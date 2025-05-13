import React from "react";
import Image from "next/image";
import Link from "next/link";

const CampaignSideBar = ({ campaign }) => {
  return (
    <aside className="w-full md:w-64 bg-gray-900 p-6 flex flex-col items-center">
      <div className="w-24 h-24 mb-6 rounded-full overflow-hidden border-4 border-indigo-600">
        <Image
          src={campaign.imageUrl || "/placeholder.png"}
          alt={campaign.title}
          width={96}
          height={96}
          className="object-cover"
        />
      </div>
      <h2 className="text-2xl font-bold mb-1 text-indigo-400 text-center">
        {campaign.title}
      </h2>
      <p className="text-gray-400 text-sm mb-8 text-center">Campaign</p>
      <div className="mt-6 font-medium text-gray-300 text-center">
        <p>{campaign.description}</p>
      </div>
      <div className="mt-10 w-full">
        <Link href={`/campaigns/${campaign.id}`}>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg w-full">
            View Campaign
          </button>
        </Link>
      </div>
    </aside>
  );
};

export default CampaignSideBar;