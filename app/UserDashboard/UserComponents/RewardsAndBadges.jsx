"use client";

import React from "react";
import { motion } from "framer-motion";
import { Medal, Star } from "lucide-react";

const donorLevels = [
  { level: "Bronze", min: 0, max: 499 },
  { level: "Silver", min: 500, max: 999 },
  { level: "Gold", min: 1000, max: Infinity },
];

const userStats = {
  totalDonated: 12000,
  totalDonations: 30,
};

const earnedBadges = [
  { name: "30 Donations", icon: <Star className="text-blue-400" /> },
  { name: "$12000 Donated", icon: <Medal className="text-green-500" /> },
];

const getDonorLevel = (amount) => {
  return donorLevels.find((level) => amount >= level.min && amount <= level.max)?.level;
};

export default function RewardsAndBadges() {
  const donorLevel = getDonorLevel(userStats.totalDonated);

  return (
    <div className="space-y-6 bg-black  p-6 text-white flex justify-around items-center">
      <div className="bg-[#0f172a] rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-2 text-blue-400">Your Donor Level</h2>
        <p className="text-3xl font-bold text-green-500">{donorLevel}</p>
        <p className="text-sm text-gray-300 mt-1">
          You've donated ${userStats.totalDonated} so far.
        </p>
      </div>
      <div className="bg-[#0f172a] rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-300">Your Badges</h2>
        <div className="flex flex-wrap gap-4">
          {earnedBadges.map((badge, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 bg-[#1e293b] text-white px-4 py-2 rounded-xl shadow-md"
            >
              {badge.icon}
              <span>{badge.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
