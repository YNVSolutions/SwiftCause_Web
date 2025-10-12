import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../shared/ui/select';
import { getOrganizations } from '../../shared/api/firestoreService';
import { AdminSession } from '../../app/App';
import { Building } from 'lucide-react';

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

    useEffect(() => {
        const fetchOrgs = async () => {
            try {
                const orgs = await getOrganizations();
                setOrganizations(orgs as Organization[]);
            } catch (error) {
                console.error("Failed to fetch organizations:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrgs();
    }, []);

    if (loading) {
        return <div className="text-sm text-gray-500">Loading organizations...</div>;
    }

    return (
        <div className="flex items-center space-x-2 border-l pl-4 ml-4">
            <Building className="w-5 h-5 text-gray-500" />
            <Select
                value={userSession.user.organizationId}
                onValueChange={onOrganizationChange}
            >
                <SelectTrigger className="w-auto border-0 shadow-none bg-transparent">
                    <SelectValue placeholder="Select Organization" />
                </SelectTrigger>
                <SelectContent>
                    <p className="p-2 text-xs text-gray-500">Switch Organization</p>
                    {organizations.map(org => (
                        <SelectItem key={org.id} value={org.id}>
                            {org.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
};
