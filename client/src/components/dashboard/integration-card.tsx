import { Integration } from "@shared/schema";
import { formatDistance } from "date-fns";
import { Button } from "@/components/ui/button";

interface IntegrationCardProps {
  integration: Integration;
}

export default function IntegrationCard({ integration }: IntegrationCardProps) {
  // Get icon and color based on integration type
  const getIntegrationType = (type: string) => {
    switch (type) {
      case "Design Tool":
        return {
          icon: "ri-palette-line",
          color: "#FFD02F",
          bgColor: "bg-[#FFD02F] bg-opacity-20"
        };
      case "Data Storage":
        return {
          icon: "ri-database-2-line",
          color: "#4EACCF",
          bgColor: "bg-[#4EACCF] bg-opacity-20"
        };
      case "Automation":
        return {
          icon: "ri-settings-line",
          color: "#FF4F00",
          bgColor: "bg-[#FF4F00] bg-opacity-20"
        };
      case "Messaging":
        return {
          icon: "ri-message-3-line",
          color: "#7C3AED",
          bgColor: "bg-[#7C3AED] bg-opacity-20"
        };
      default:
        return {
          icon: "ri-link",
          color: "#64748b",
          bgColor: "bg-neutral-500 bg-opacity-20"
        };
    }
  };

  const { icon, color, bgColor } = getIntegrationType(integration.type);
  
  const timeAgo = integration.lastUsed 
    ? formatDistance(new Date(integration.lastUsed), new Date(), { addSuffix: true })
    : 'Never used';

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-neutral-200">
      <div className="flex items-center mb-3">
        <div 
          className={`w-10 h-10 rounded-lg ${bgColor} flex items-center justify-center mr-3`}
          style={{ color }}
        >
          <i className={`${icon} text-xl`}></i>
        </div>
        <div>
          <h3 className="font-medium">{integration.name}</h3>
          <p className="text-xs text-neutral-500">{integration.type}</p>
        </div>
        <div className="ml-auto">
          <span className={`w-2 h-2 ${integration.status === "active" ? "bg-success" : "bg-neutral-300"} rounded-full inline-block`}></span>
        </div>
      </div>
      <div className="text-xs text-neutral-600 mb-3">
        <p>Last used {timeAgo}</p>
        <p>{integration.requestCount} requests this month</p>
      </div>
      <Button variant="link" size="sm" className="text-xs h-auto p-0">
        Manage
      </Button>
    </div>
  );
}
