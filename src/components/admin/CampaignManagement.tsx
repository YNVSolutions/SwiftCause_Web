import React, { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  updateDoc,
  doc
} from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface Campaign {
  id: string;
  collectedAmount: number;
  coverImageUrl: string;
  createdBy: string;
  currency: string;
  description: string;
  donationCount: number;
  endDate: Date;
  giftAidEnabled: boolean;
  goalAmount: number;
  lastUpdated: Date;
  startDate: Date;
  status: string;
  tags: string[];
  title: string;
}

export default function CampaignManagement() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [editId, setEditId] = useState<string | null>(null);

  const campaignsRef = collection(db, 'campaigns');

  useEffect(() => {
    const fetchCampaigns = async () => {
      const snapshot = await getDocs(campaignsRef);
      const data: Campaign[] = snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          collectedAmount: data.collectedAmount,
          coverImageUrl: data.coverImageUrl,
          createdBy: data.createdBy,
          currency: data.currency,
          description: data.description,
          donationCount: data.donationCount,
          endDate: data.endDate.toDate(),
          giftAidEnabled: data.giftAidEnabled,
          goalAmount: data.goalAmount,
          lastUpdated: data.lastUpdated?.toDate?.() || new Date(),
          startDate: data.startDate.toDate(),
          status: data.status,
          tags: data.tags || [],
          title: data.title
        };
      });
      setCampaigns(data);
    };
    fetchCampaigns();
  }, []);

  const handleChange = (id: string, field: keyof Campaign, value: any) => {
    setCampaigns(prev =>
      prev.map(c =>
        c.id === id ? { ...c, [field]: value } : c
      )
    );
  };

  const saveChanges = async (id: string) => {
    const campaign = campaigns.find(c => c.id === id);
    if (!campaign) return;

    const docRef = doc(db, 'campaigns', id);
    const { id: _, ...campaignData } = campaign;

    await updateDoc(docRef, campaignData);
    setEditId(null);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Campaign Editor</h1>
      {campaigns.map(c => (
        <div key={c.id} className="border p-4 mb-4 rounded-md shadow">
          {editId === c.id ? (
            <div className="space-y-2">
              <input value={c.title} onChange={e => handleChange(c.id, 'title', e.target.value)} className="border px-2 py-1 w-full" />
              <textarea value={c.description} onChange={e => handleChange(c.id, 'description', e.target.value)} className="border px-2 py-1 w-full" />
              <input value={c.collectedAmount} onChange={e => handleChange(c.id, 'collectedAmount', Number(e.target.value))} className="border px-2 py-1 w-full" />
              <input value={c.goalAmount} onChange={e => handleChange(c.id, 'goalAmount', Number(e.target.value))} className="border px-2 py-1 w-full" />
              <input value={c.status} onChange={e => handleChange(c.id, 'status', e.target.value)} className="border px-2 py-1 w-full" />
              <button onClick={() => saveChanges(c.id)} className="bg-green-500 text-white px-4 py-1 rounded">Save</button>
              <button onClick={() => setEditId(null)} className="ml-2 text-sm text-gray-500">Cancel</button>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-semibold">{c.title}</h2>
              <p>{c.description}</p>
              <p><strong>Status:</strong> {c.status}</p>
              <p><strong>Raised:</strong> {c.collectedAmount}</p>
              <p><strong>Goal:</strong> {c.goalAmount}</p>
              <button onClick={() => setEditId(c.id)} className="text-blue-500 mt-2">Edit</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
