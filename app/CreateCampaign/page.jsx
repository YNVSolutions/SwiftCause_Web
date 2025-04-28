"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import NavBar from '../Components/NavBar'
import { useRouter } from 'next/navigation';
import { storage, db } from '../Auth/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

const Page = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [campaignName, setCampaignName] = useState('');
  const [description, setDescription] = useState('');
  const [donationAmount, setDonationAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image) {
      alert("Please upload an image!");
      return;
    }

    setLoading(true);

    try {
      const imageRef = ref(storage, `campaignImages/${uuidv4()}-${image.name}`);
      await uploadBytes(imageRef, image);
      const imageUrl = await getDownloadURL(imageRef);


      await addDoc(collection(db, "campaigns"), {
        campaignName,
        description,
        donationAmount: Number(donationAmount),
        imageUrl,
        createdAt: new Date(),
      });

      alert("Campaign created successfully!");
      setCampaignName('');
      setDescription('');
      setDonationAmount('');
      setImage(null);
      setPreviewUrl(null);

      router.push('/AdminDashboard');

    } catch (error) {
      console.error("Error creating campaign:", error);
      alert("Failed to create campaign. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      
      <div className="pt-20 flex flex-col md:flex-row h-screen bg-black text-white overflow-hidden">
        <aside className="w-full md:w-64 bg-gray-900 p-6 flex flex-col items-center">
          <div className="w-24 h-24 mb-6 rounded-full overflow-hidden border-4 border-blue-500">
            <Image src="/charity.png" alt="User Avatar" width={96} height={96} className="object-cover" />
          </div>
          <h2 className="text-2xl font-bold mb-1 text-blue-400">Heart Reach</h2>
          <p className="text-gray-400 text-sm mb-8">Foundation Fundraiser</p>
          <Link href='/AdminDashboard'>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg w-full">
              Profile
            </button>
          </Link>
          <div className="mt-6 font-medium text-center text-gray-300">
            <p>
              HeartReach Foundation empowers communities through healthcare, education, disaster relief, and women’s initiatives. We believe compassion creates change and work together to build a brighter, more equitable future for all.
            </p>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <h1 className="text-5xl font-bold text-blue-400 mb-10 text-center">
            Create Campaigns
          </h1>

          <div className="max-w-xl mx-auto bg-gray-900 text-white shadow-lg p-8 rounded-2xl border border-gray-500">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block mb-2 font-semibold text-blue-300">Upload Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-400
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-lg file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-500 file:text-white
                    hover:file:bg-blue-600"
                />
                {previewUrl && (
                  <div className="mt-4">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg border-2 border-blue-400 transition-transform duration-300 hover:scale-110"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block mb-2 font-semibold text-blue-300">Campaign Name</label>
                <input
                  type="text"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  className="w-full px-4 py-2 bg-black border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Enter campaign name"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 font-semibold text-blue-300">Campaign Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 bg-black border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Describe your campaign"
                  rows="4"
                  required
                ></textarea>
              </div>

              <div>
                <label className="block mb-2 font-semibold text-blue-300">Donation Amount ($)</label>
                <input
                  type="number"
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(e.target.value)}
                  className="w-full px-4 py-2 bg-black border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                  placeholder="Minimum donation amount"
                  required
                  min="1"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-bold transition duration-300 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Campaign"}
              </button>
            </form>
          </div>
        </main>
      </div>
    </>
  );
};

export default Page;
