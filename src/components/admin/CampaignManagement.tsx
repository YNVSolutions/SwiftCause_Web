import React, { useEffect, useState } from 'react';
import { db } from '../../lib/firebase';
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  DocumentData,
} from 'firebase/firestore';

const CampaignManagement = () => {
  const [campaigns, setCampaigns] = useState<DocumentData[]>([]);
  const [editingField, setEditingField] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchCampaigns = async () => {
      const querySnapshot = await getDocs(collection(db, 'campaigns'));
      const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCampaigns(docs);
    };

    fetchCampaigns();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, id: string, field: string) => {
    setCampaigns(prev =>
      prev.map(campaign =>
        campaign.id === id ? { ...campaign, [field]: e.target.value } : campaign
      )
    );
    setEditingField(prev => ({ ...prev, [`${id}-${field}`]: e.target.value }));
  };

  const handleSave = async (id: string, field: string) => {
    const campaignRef = doc(db, 'campaigns', id);
    await updateDoc(campaignRef, {
      [field]: editingField[`${id}-${field}`],
    });
    setEditingField(prev => {
      const updated = { ...prev };
      delete updated[`${id}-${field}`];
      return updated;
    });
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Campaign Management</h1>
      <div className="space-y-8">
        {campaigns.map((campaign) => (
          <div key={campaign.id} className="border rounded-lg p-4 shadow-md">
            <div className="space-y-2">
              {['title', 'description', 'collectedAmount', 'goalAmount', 'status'].map((field) => (
                <div key={field} className="flex items-center">
                  <label className="w-40 font-semibold capitalize">{field}:</label>
                  {field === 'description' ? (
                    <textarea
                      value={campaign[field] || ''}
                      onChange={(e) => handleChange(e, campaign.id, field)}
                      className="border rounded p-2 flex-1"
                    />
                  ) : (
                    <input
                      type="text"
                      value={campaign[field] || ''}
                      onChange={(e) => handleChange(e, campaign.id, field)}
                      className="border rounded p-2 flex-1"
                    />
                  )}
                  <button
                    onClick={() => handleSave(campaign.id, field)}
                    className="ml-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                  >
                    Save
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CampaignManagement;
