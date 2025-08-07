import React, { useEffect, useState } from 'react';
import { db } from '../../lib/firebase';
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  DocumentData,
} from 'firebase/firestore';
import { FaEdit, FaSave, FaTimes, FaSearch, FaChevronDown, FaEllipsisV } from 'react-icons/fa';

const CampaignManagement = () => {
  const [campaigns, setCampaigns] = useState<DocumentData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedCampaign, setEditedCampaign] = useState<DocumentData | null>(null);

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

  const handleEdit = (campaign: DocumentData) => {
    setEditingId(campaign.id);
    setEditedCampaign({ ...campaign });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditedCampaign(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>, field: string) => {
    if (editedCampaign) {
      setEditedCampaign({ ...editedCampaign, [field]: e.target.value });
    }
  };

  const handleSave = async () => {
    if (editedCampaign && editingId) {
      try {
        const campaignRef = doc(db, 'campaigns', editingId);
        await updateDoc(campaignRef, editedCampaign);
        setCampaigns(prev =>
          prev.map(campaign =>
            campaign.id === editingId ? editedCampaign : campaign
          )
        );
        console.log(`Campaign ${editingId} successfully updated!`);
      } catch (error) {
        console.error("Error updating document: ", error);
      } finally {
        setEditingId(null);
        setEditedCampaign(null);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  const filteredCampaigns = campaigns.filter(campaign =>
    campaign.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Top Header */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <div className="relative flex-1 mr-4">
          <input
            type="text"
            placeholder="Search campaigns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button className="flex items-center px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none">
              All Statuses <FaChevronDown className="ml-2 h-3 w-3 text-gray-500" />
            </button>
          </div>
          <div className="relative">
            <button className="flex items-center px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none">
              All Categories <FaChevronDown className="ml-2 h-3 w-3 text-gray-500" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Section Header */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Campaigns ({filteredCampaigns.length})</h2>
          <p className="text-gray-500 text-sm">Manage your donation campaigns</p>
        </div>

        {/* Campaign List */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-10 text-sm font-medium text-gray-500 bg-gray-50 py-3 px-6 border-b border-gray-200">
            <div className="col-span-3">Campaign</div>
            <div className="col-span-2">Progress</div>
            <div className="col-span-2">Performance</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-1">End Date</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>

          {/* Campaign Rows */}
          <div className="divide-y divide-gray-200">
            {filteredCampaigns.map((campaign) => {
              const isEditing = editingId === campaign.id;
              const currentCampaign = isEditing ? editedCampaign : campaign;

              const collected = Number(currentCampaign?.collectedAmount) || 0;
              const goal = Number(currentCampaign?.goalAmount) || 1;
              const progress = Math.round((collected / goal) * 100);
              const donors = currentCampaign?.donors || Math.floor(Math.random() * 500) + 100;
              const avgDonation = (collected / donors).toFixed(2);
              const conversion = (Math.random() * 100).toFixed(1);
              const status = currentCampaign?.status || 'Active';
              const endDate = currentCampaign?.endDate?.seconds
                ? new Date(currentCampaign.endDate.seconds * 1000).toLocaleDateString('en-US')
                : 'N/A';
              const isExpired = currentCampaign?.endDate?.seconds
                ? new Date(currentCampaign.endDate.seconds * 1000) < new Date()
                : false;

              return (
                <div key={campaign.id} className="grid grid-cols-10 items-center py-4 px-6 hover:bg-gray-50 transition-colors duration-150">
                  {/* Campaign Column */}
                  <div className="col-span-3 flex items-center space-x-3">
                    <img
                      src={currentCampaign?.coverImageUrl || 'https://via.placeholder.com/40'}
                      alt={currentCampaign?.title}
                      className="w-10 h-10 object-cover rounded-md flex-shrink-0"
                    />
                    <div>
                      {isEditing ? (
                        <input
                          type="text"
                          value={currentCampaign?.title || ''}
                          onChange={(e) => handleChange(e, 'title')}
                          className="w-full text-sm font-medium border border-gray-300 rounded-md p-1"
                        />
                      ) : (
                        <p className="text-sm font-medium text-gray-900">{campaign.title}</p>
                      )}
                      <p className="text-xs text-gray-500">{campaign.category || 'Global Health'} &middot; Recurring &middot; Custom</p>
                    </div>
                  </div>

                  {/* Progress Column */}
                  <div className="col-span-2 space-y-1">
                    {isEditing ? (
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={currentCampaign?.collectedAmount || ''}
                          onChange={(e) => handleChange(e, 'collectedAmount')}
                          className="w-2/5 text-sm border border-gray-300 rounded-md p-1"
                        />
                        <input
                          type="text"
                          value={currentCampaign?.goalAmount || ''}
                          onChange={(e) => handleChange(e, 'goalAmount')}
                          className="w-2/5 text-sm border border-gray-300 rounded-md p-1"
                        />
                      </div>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-gray-800">${collected.toLocaleString()} <span className="text-gray-500 font-normal">({progress}%)</span></p>
                        <div className="w-4/5 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(progress)}`}
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500">Goal: ${goal.toLocaleString()}</p>
                      </>
                    )}
                  </div>

                  {/* Performance Column */}
                  <div className="col-span-2 text-sm text-gray-800">
                    <p>{donors} donors</p>
                    <p>${avgDonation} avg</p>
                    <p>~{conversion}% conv.</p>
                  </div>

                  {/* Status Column */}
                  <div className="col-span-1">
                    {isEditing ? (
                      <select
                        value={currentCampaign?.status || ''}
                        onChange={(e) => handleChange(e, 'status')}
                        className="w-full text-sm border border-gray-300 rounded-md p-1"
                      >
                        <option value="active">Active</option>
                        <option value="paused">Paused</option>
                      </select>
                    ) : (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                        {status}
                      </span>
                    )}
                  </div>

                  {/* End Date Column */}
                  <div className="col-span-1 text-sm text-gray-800">
                    <p>{endDate}</p>
                    {isExpired && <p className="text-xs text-red-500">Expired</p>}
                  </div>

                  {/* Actions Column */}
                  <div className="col-span-1 flex justify-end items-center space-x-2 text-gray-500">
                    {isEditing ? (
                      <>
                        <button onClick={handleSave} className="p-2 text-green-600 hover:bg-gray-100 rounded-md"><FaSave className="h-4 w-4" /></button>
                        <button onClick={handleCancelEdit} className="p-2 text-red-600 hover:bg-gray-100 rounded-md"><FaTimes className="h-4 w-4" /></button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleEdit(campaign)} className="p-2 hover:bg-gray-100 rounded-md"><FaEdit className="h-4 w-4" /></button>
                        <button className="p-2 hover:bg-gray-100 rounded-md"><FaEllipsisV className="h-4 w-4" /></button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredCampaigns.length === 0 && (
            <p className="text-center text-gray-500 text-lg py-8">No campaigns found matching your search.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignManagement;