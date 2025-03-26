import { Deployment } from "@shared/schema";
import { formatDistance } from "date-fns";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DeploymentItemProps {
  deployment: Deployment;
  projectName: string;
}

export default function DeploymentItem({ deployment, projectName }: DeploymentItemProps) {
  const [logsOpen, setLogsOpen] = useState(false);

  const getEnvironmentBadge = (environment: string) => {
    switch (environment.toLowerCase()) {
      case "production":
        return "bg-blue-100 text-blue-800";
      case "staging":
        return "bg-purple-100 text-purple-800";
      case "development":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "success":
        return "text-success";
      case "failed":
        return "text-danger";
      case "in_progress":
        return "text-warning";
      default:
        return "text-neutral-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "success":
        return "ri-checkbox-circle-fill";
      case "failed":
        return "ri-error-warning-fill";
      case "in_progress":
        return "ri-loader-4-line";
      default:
        return "ri-question-line";
    }
  };

  const deployedAt = deployment.deployedAt 
    ? formatDistance(new Date(deployment.deployedAt), new Date(), { addSuffix: true })
    : 'Unknown';

  return (
    <>
      <tr className="border-b border-neutral-200 hover:bg-neutral-50 transition-colors">
        <td className="px-4 py-3 text-sm">{projectName}</td>
        <td className="px-4 py-3 text-sm">
          <span className={`px-2 py-0.5 ${getEnvironmentBadge(deployment.environment)} rounded text-xs`}>
            {deployment.environment}
          </span>
        </td>
        <td className="px-4 py-3 text-sm">
          <span className={`flex items-center ${getStatusColor(deployment.status)}`}>
            <i className={`${getStatusIcon(deployment.status)} mr-1`}></i>
            {deployment.status.charAt(0).toUpperCase() + deployment.status.slice(1)}
          </span>
        </td>
        <td className="px-4 py-3 text-sm text-neutral-600">{deployedAt}</td>
        <td className="px-4 py-3 text-sm">{deployment.deployedBy || 'Rashed AI'}</td>
        <td className="px-4 py-3 text-sm">
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0" 
              title="View Logs"
              onClick={() => setLogsOpen(true)}
            >
              <i className="ri-file-list-line"></i>
            </Button>
            {deployment.status === "success" && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0" 
                title="Rollback"
              >
                <i className="ri-arrow-go-back-line"></i>
              </Button>
            )}
            {deployment.status === "failed" && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0" 
                title="Retry"
              >
                <i className="ri-restart-line"></i>
              </Button>
            )}
          </div>
        </td>
      </tr>

      {/* Logs Dialog */}
      <Dialog open={logsOpen} onOpenChange={setLogsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Deployment Logs</DialogTitle>
            <DialogDescription>
              {projectName} • {deployment.environment} • {deployedAt}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[400px] rounded-md border p-4 bg-black text-white font-mono text-sm">
            {deployment.logs ? (
              <pre>{deployment.logs}</pre>
            ) : (
              <div className="text-center py-4 text-gray-500">No logs available</div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
