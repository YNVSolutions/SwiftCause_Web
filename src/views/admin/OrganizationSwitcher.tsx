import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../shared/ui/select';
import { getOrganizations } from '../../shared/api';
import { AdminSession } from '../../shared/types';
import { Building2, Check, Search } from 'lucide-react';
import { Skeleton } from '../../shared/ui/skeleton';
import { Input } from '../../shared/ui/input';

interface Organization {
    id: string;
    name: string;
}

interface OrganizationSwitcherProps {
    userSession: AdminSession;
    onOrganizationChange: (organizationId: string) => void;
}

export const OrganizationSwitcher: React.FC<OrganizationSwitcherProps> = ({ userSession, onOrganizationChange }) => {
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchOrgs = async () => {
            try {
                const orgs = await getOrganizations();
                // Filter out organizations without names and ensure they have valid data
                const validOrgs = (orgs as Organization[]).filter(org => org && org.id && org.name);
                setOrganizations(validOrgs);
            } catch (error) {
                console.error("Failed to fetch organizations:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrgs();
    }, []);

    const currentOrg = organizations.find(org => org.id === userSession.user.organizationId);

    // Filter organizations based on search query
    const filteredOrganizations = organizations.filter(org =>
        org?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <Skeleton className="h-10 w-[280px]" />
        );
    }

    return (
        <Select
            value={userSession.user.organizationId || undefined}
            onValueChange={onOrganizationChange}
        >
            <SelectTrigger className="w-[280px] h-10 bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-2.5 flex-1">
                    <div className="w-7 h-7 rounded-md bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-4 h-4 text-white" />
                    </div>
                    <SelectValue placeholder="Select Organization">
                        <span className="text-sm font-medium text-gray-900 truncate">
                            {currentOrg?.name || 'Select Organization'}
                        </span>
                    </SelectValue>
                </div>
            </SelectTrigger>
            <SelectContent className="w-[280px]">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 border-b">
                    Available Organizations
                </div>
                
                {/* Search Bar */}
                <div className="p-2 border-b">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Search organizations..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 h-9 text-sm border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>

                {/* Organizations List */}
                <div className="max-h-[300px] overflow-y-auto">
                    {filteredOrganizations.length === 0 ? (
                        <div className="px-3 py-6 text-center text-sm text-gray-500">
                            {searchQuery ? 'No organizations found' : 'No organizations available'}
                        </div>
                    ) : (
                        filteredOrganizations.map(org => {
                            const isSelected = org.id === userSession.user.organizationId;
                            return (
                                <SelectItem 
                                    key={org.id} 
                                    value={org.id}
                                    className="cursor-pointer py-2.5"
                                >
                                    <div className="flex items-center justify-between w-full gap-3">
                                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                            <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${
                                                isSelected 
                                                    ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
                                                    : 'bg-gray-100'
                                            }`}>
                                                <Building2 className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-gray-500'}`} />
                                            </div>
                                            <span className="text-sm font-medium text-gray-900 truncate">{org.name}</span>
                                        </div>
                                        {isSelected && (
                                            <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                        )}
                                    </div>
                                </SelectItem>
                            );
                        })
                    )}
                </div>
            </SelectContent>
        </Select>
    );
};
