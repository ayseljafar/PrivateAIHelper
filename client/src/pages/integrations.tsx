import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Integration } from "@shared/schema";
import IntegrationCard from "@/components/dashboard/integration-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Integrations() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const { data: integrations, isLoading } = useQuery<Integration[]>({
    queryKey: ['/api/integrations'],
  });

  const filteredIntegrations = integrations?.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "all" || integration.type === activeTab;
    return matchesSearch && matchesTab;
  });

  const integrationTypes = [
    { value: "all", label: "All" },
    { value: "Design Tool", label: "Design Tools" },
    { value: "Data Storage", label: "Data Storage" },
    { value: "Automation", label: "Automation" },
    { value: "Messaging", label: "Messaging" },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">Integrations</h1>
            <p className="text-neutral-600">Connect external services to enhance your AI assistant</p>
          </div>
          <Button className="flex items-center gap-1">
            <i className="ri-add-line"></i>
            Add Integration
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <Input
            placeholder="Search integrations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="md:max-w-sm"
          />
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="h-10">
              {integrationTypes.map(type => (
                <TabsTrigger key={type.value} value={type.value}>
                  {type.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : filteredIntegrations && filteredIntegrations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIntegrations.map(integration => (
            <IntegrationCard key={integration.id} integration={integration} />
          ))}
          
          <div className="border border-neutral-200 border-dashed rounded-lg p-4 flex flex-col items-center justify-center h-full">
            <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center mb-2">
              <i className="ri-add-line text-neutral-500"></i>
            </div>
            <p className="text-sm text-neutral-500 mb-1">Connect New Service</p>
            <p className="text-xs text-neutral-400 text-center">Add more integrations to enhance capabilities</p>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-neutral-200">
          <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4">
            <i className="ri-link text-2xl text-neutral-500"></i>
          </div>
          <h3 className="text-lg font-medium text-neutral-700 mb-2">
            {searchQuery || activeTab !== "all" 
              ? "No integrations match your filters" 
              : "No integrations yet"}
          </h3>
          <p className="text-neutral-500 max-w-md mx-auto mb-6">
            {searchQuery || activeTab !== "all" 
              ? "Try adjusting your search or filter criteria." 
              : "Connect with external services to enhance Rashed's capabilities."}
          </p>
          {!searchQuery && activeTab === "all" && (
            <Button>Set Up First Integration</Button>
          )}
        </div>
      )}

      <div className="mt-8 bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
        <h2 className="font-semibold text-lg mb-4">Available Integration Types</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="border border-neutral-200 rounded-lg p-4">
            <div className="bg-[#FFD02F] bg-opacity-20 w-12 h-12 rounded-lg flex items-center justify-center mb-3">
              <i className="ri-palette-line text-xl text-[#FFD02F]"></i>
            </div>
            <h3 className="font-medium mb-1">Design Tools</h3>
            <p className="text-sm text-neutral-600 mb-3">
              Integrate with Midjourney AI, Figma, and other design tools for visual assets.
            </p>
            <Button variant="outline" size="sm">Browse Tools</Button>
          </div>
          
          <div className="border border-neutral-200 rounded-lg p-4">
            <div className="bg-[#4EACCF] bg-opacity-20 w-12 h-12 rounded-lg flex items-center justify-center mb-3">
              <i className="ri-database-2-line text-xl text-[#4EACCF]"></i>
            </div>
            <h3 className="font-medium mb-1">Data Storage</h3>
            <p className="text-sm text-neutral-600 mb-3">
              Connect with Airtable, Google Drive, AWS S3, and more for data management.
            </p>
            <Button variant="outline" size="sm">Browse Storage</Button>
          </div>
          
          <div className="border border-neutral-200 rounded-lg p-4">
            <div className="bg-[#FF4F00] bg-opacity-20 w-12 h-12 rounded-lg flex items-center justify-center mb-3">
              <i className="ri-settings-line text-xl text-[#FF4F00]"></i>
            </div>
            <h3 className="font-medium mb-1">Automation</h3>
            <p className="text-sm text-neutral-600 mb-3">
              Set up workflows with Zapier, Make.com, and automation platforms.
            </p>
            <Button variant="outline" size="sm">Browse Automation</Button>
          </div>
          
          <div className="border border-neutral-200 rounded-lg p-4">
            <div className="bg-[#7C3AED] bg-opacity-20 w-12 h-12 rounded-lg flex items-center justify-center mb-3">
              <i className="ri-message-3-line text-xl text-[#7C3AED]"></i>
            </div>
            <h3 className="font-medium mb-1">Messaging & CRM</h3>
            <p className="text-sm text-neutral-600 mb-3">
              Integrate with Slack, Discord, HubSpot, and other communication platforms.
            </p>
            <Button variant="outline" size="sm">Browse Messaging</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
