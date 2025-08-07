import React, { useEffect, useState } from 'react';
import { db } from '../../lib/firebase';
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  DocumentData,
} from 'firebase/firestore';
import { FaArrowLeft } from 'react-icons/fa';

const CampaignManagement = () => {
  const [campaigns, setCampaigns] = useState<DocumentData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');


  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'campaigns'));
        const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCampaigns(docs);
      } catch (error) {
        console.error("Error fetching campaigns: ", error);
      }
    };

    fetchCampaigns();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>, id: string, field: string) => {
    const value = e.target.value;
    setCampaigns(prev =>
      prev.map(campaign =>
        campaign.id === id ? { ...campaign, [field]: value } : campaign
      )
    );
  };

  const handleSave = async (id: string, field: string) => {
    try {
      const campaignToUpdate = campaigns.find(campaign => campaign.id === id);
      if (campaignToUpdate) {
        const campaignRef = doc(db, 'campaigns', id);
        await updateDoc(campaignRef, {
          [field]: campaignToUpdate[field],
        });
        console.log(`'${field}' field for document ${id} successfully updated!`);
      }
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  const filteredCampaigns = campaigns.filter(campaign =>
    campaign.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
 
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <button
              
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              <FaArrowLeft className="h-5 w-5 mr-2" />
              <span className="text-lg font-medium">Back to Dashboard</span>
            </button>
            <h1 className="text-3xl font-bold text-gray-800">Campaign Management</h1>
          </div>
          <input
            type="text"
            placeholder="Search campaigns by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-sm px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
          />
        </div>

        <div className="grid gap-8">
          {filteredCampaigns.map((campaign) => (
            <div key={campaign.id} className="bg-white rounded-xl shadow-lg p-6 flex items-start space-x-6">
              <img
                src={campaign.coverImageUrl}
                alt={campaign.title}
                className="w-48 h-48 object-cover rounded-md flex-shrink-0 border border-gray-200"
              />
              <div className="flex-1 space-y-4">
                {['title', 'description', 'collectedAmount', 'goalAmount', 'status'].map((field) => (
                  <div key={field} className="flex items-center justify-between">
                    <label className="w-48 font-semibold text-gray-700 capitalize">{field}:</label>
                    <div className="flex-1 flex items-center space-x-2">
                      {field === 'description' ? (
                        <textarea
                          value={campaign[field] || ''}
                          onChange={(e) => handleChange(e, campaign.id, field)}
                          className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                          rows={3}
                        />
                      ) : field === 'status' ? (
                        <select
                          value={campaign[field] || ''}
                          onChange={(e) => handleChange(e, campaign.id, field)}
                          className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                        >
                          <option value="active">Active</option>
                          <option value="paused">Paused</option>
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={campaign[field] || ''}
                          onChange={(e) => handleChange(e, campaign.id, field)}
                          className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                        />
                      )}
                      <button
                        onClick={() => handleSave(campaign.id, field)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md shadow-sm transition-colors duration-200"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {filteredCampaigns.length === 0 && (
            <p className="text-center text-gray-500 text-lg mt-8">No campaigns found matching your search.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignManagement;