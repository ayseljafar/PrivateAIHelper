import { Environment } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { formatDistance } from "date-fns";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface EnvironmentCardProps {
  environment: Environment;
}

export default function EnvironmentCard({ environment }: EnvironmentCardProps) {
  const [deployDialogOpen, setDeployDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const { toast } = useToast();

  const deployMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/environments/${environment.id}/deploy`, {});
    },
    onSuccess: () => {
      toast({
        title: "Deployment initiated",
        description: `Deploying to ${environment.name}...`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/deployments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/environments'] });
      setDeployDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Deployment failed",
        description: error.message || "Could not start deployment",
        variant: "destructive",
      });
    },
  });

  const getEnvironmentBadge = (type: string) => {
    switch (type.toLowerCase()) {
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

  const getConfig = () => {
    if (!environment.config) return [];
    
    try {
      const config = typeof environment.config === 'string' 
        ? JSON.parse(environment.config) 
        : environment.config;
        
      return Object.entries(config).map(([key, value]) => ({
        label: key.replace(/_/g, ' ')
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' '),
        value: String(value)
      }));
    } catch (e) {
      return [];
    }
  };

  const configItems = getConfig();
  const lastDeployed = environment.lastDeployed
    ? formatDistance(new Date(environment.lastDeployed), new Date(), { addSuffix: true })
    : 'Never';

  return (
    <>
      <div className="border border-neutral-200 rounded-lg p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <span className={`px-2 py-0.5 ${getEnvironmentBadge(environment.type)} rounded text-xs mb-1 inline-block`}>
              {environment.type}
            </span>
            <h3 className="font-medium">{environment.name}</h3>
          </div>
          <div className="flex">
            <span className={`w-2 h-2 ${environment.status === "active" ? "bg-success" : "bg-neutral-300"} rounded-full inline-block mt-1`}></span>
          </div>
        </div>
        
        <div className="space-y-2 text-sm mb-4">
          {configItems.slice(0, 3).map((item, index) => (
            <div key={index} className="flex justify-between">
              <span className="text-neutral-600">{item.label}:</span>
              <span className="truncate max-w-[120px]">{item.value}</span>
            </div>
          ))}
          <div className="flex justify-between">
            <span className="text-neutral-600">Last Deployed:</span>
            <span>{lastDeployed}</span>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            className="flex-1"
            onClick={() => setDeployDialogOpen(true)}
          >
            Deploy
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            className="flex items-center justify-center"
            onClick={() => setSettingsDialogOpen(true)}
          >
            <i className="ri-settings-line"></i>
          </Button>
        </div>
      </div>

      {/* Deploy Confirmation Dialog */}
      <Dialog open={deployDialogOpen} onOpenChange={setDeployDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deploy to {environment.name}</DialogTitle>
            <DialogDescription>
              Are you sure you want to deploy to {environment.type}?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm">
              This will deploy the latest version of your project to the {environment.type} environment.
            </p>
            {environment.type === "production" && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800">
                <div className="flex items-start">
                  <i className="ri-alert-line mt-0.5 mr-2"></i>
                  <p>
                    You are deploying to <strong>production</strong>. This will affect your live application.
                  </p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeployDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => deployMutation.mutate()}
              disabled={deployMutation.isPending}
            >
              {deployMutation.isPending ? "Deploying..." : "Deploy"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{environment.name} Settings</DialogTitle>
            <DialogDescription>
              Configure your {environment.type} environment settings
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {configItems.map((item, index) => (
              <div key={index} className="grid grid-cols-4 items-center gap-4">
                <label className="text-sm font-medium col-span-1">
                  {item.label}
                </label>
                <input
                  type="text"
                  defaultValue={item.value}
                  className="col-span-3 px-3 py-2 border border-neutral-200 rounded-md"
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSettingsDialogOpen(false)}>
              Cancel
            </Button>
            <Button>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
