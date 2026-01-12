import React from "react";
import { FileText, Image, DollarSign, Zap } from "lucide-react";

interface Tab {
  id: "basic" | "media-gallery" | "funding-details" | "kiosk-distribution";
  label: string;
  icon: React.ReactNode;
}

interface TabNavigationSidebarProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: "basic" | "media-gallery" | "funding-details" | "kiosk-distribution") => void;
}

export const TabNavigationSidebar: React.FC<TabNavigationSidebarProps> = ({
  tabs,
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900">Campaign Sections</h3>
      </div>

      {/* Scrollable Navigation */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden" style={{ scrollbarGutter: "stable" }}>
        <nav className="p-3 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200"
              style={{
                backgroundColor: activeTab === tab.id ? "#03AC13" : "transparent",
                color: activeTab === tab.id ? "white" : "#374151",
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.backgroundColor = "#f3f4f6";
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.backgroundColor = "transparent";
                }
              }}
            >
              <div className="flex items-center justify-center w-5 h-5">
                {tab.icon}
              </div>
              <span className="flex-1 text-left">{tab.label}</span>
              {activeTab === tab.id && (
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "white" }}></div>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <p className="text-xs text-gray-600">
          Complete all sections to publish your campaign.
        </p>
      </div>
    </div>
  );
};

export const getCampaignTabs = (): Tab[] => [
  {
    id: "basic",
    label: "General Information",
    icon: <FileText className="w-5 h-5" />,
  },
  {
    id: "media-gallery",
    label: "Visual Identity",
    icon: <Image className="w-5 h-5" />,
  },
  {
    id: "funding-details",
    label: "Financial Goals",
    icon: <DollarSign className="w-5 h-5" />,
  },
  {
    id: "kiosk-distribution",
    label: "Kiosk Distribution",
    icon: <Zap className="w-5 h-5" />,
  },
];
