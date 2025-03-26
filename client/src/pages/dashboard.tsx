import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import StatCard from "@/components/dashboard/stat-card";
import ActivityItem from "@/components/dashboard/activity-item";
import ApprovalCard from "@/components/dashboard/approval-card";
import IntegrationCard from "@/components/dashboard/integration-card";
import { Button } from "@/components/ui/button";
import { Project, Activity, Approval, Integration } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";

export default function Dashboard() {
  const queryClient = useQueryClient();
  const [stats, setStats] = useState({
    projects: 0,
    deployments: 0,
    apiCalls: 0,
    pendingApprovals: 0,
  });

  const { data: activities, isLoading: isLoadingActivities } = useQuery<Activity[]>({
    queryKey: ['/api/activities'],
  });

  const { data: approvals, isLoading: isLoadingApprovals } = useQuery<Approval[]>({
    queryKey: ['/api/approvals'],
  });

  const { data: integrations, isLoading: isLoadingIntegrations } = useQuery<Integration[]>({
    queryKey: ['/api/integrations'],
  });

  const { data: projects, isLoading: isLoadingProjects } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });

  const { data: deployments, isLoading: isLoadingDeployments } = useQuery<any>({
    queryKey: ['/api/deployments'],
  });

  const { data: apiUsage, isLoading: isLoadingApiUsage } = useQuery<any>({
    queryKey: ['/api/stats/apiUsage'],
  });

  useEffect(() => {
    if (projects) {
      setStats(prev => ({ ...prev, projects: projects.length }));
    }
    if (deployments) {
      setStats(prev => ({ ...prev, deployments: deployments.length }));
    }
    if (apiUsage) {
      setStats(prev => ({ ...prev, apiCalls: apiUsage.total }));
    }
    if (approvals) {
      setStats(prev => ({ ...prev, pendingApprovals: approvals.length }));
    }
  }, [projects, deployments, apiUsage, approvals]);

  const handleApproval = async (id: number, approved: boolean) => {
    try {
      await apiRequest('POST', `/api/approvals/${id}/${approved ? 'approve' : 'reject'}`);
      // Refetch approvals
      await queryClient.invalidateQueries({ queryKey: ['/api/approvals'] });
    } catch (error) {
      console.error('Failed to process approval:', error);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
        <p className="text-neutral-600">Welcome back! Here's an overview of your AI assistant activities.</p>
      </div>
        
        {/* Stats overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard 
            title="Projects"
            value={stats.projects}
            change="+3 new this month"
            positive={true}
            icon="ri-folder-line"
            color="primary"
          />
          
          <StatCard 
            title="Deployments"
            value={stats.deployments}
            change="+5 in the last week"
            positive={true}
            icon="ri-rocket-line"
            color="secondary"
          />
          
          <StatCard 
            title="API Calls"
            value={stats.apiCalls}
            change={`${apiUsage?.percentage || 0}% of monthly limit`}
            positive={null}
            icon="ri-code-line"
            color="accent"
          />
          
          <StatCard 
            title="Pending Approvals"
            value={stats.pendingApprovals}
            change="Requires attention"
            positive={false}
            icon="ri-timer-line"
            color="warning"
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Recent activity */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-neutral-200 flex justify-between items-center">
              <h2 className="font-semibold">Recent Activity</h2>
              <Button variant="link" size="sm">View All</Button>
            </div>
            <div className="p-4">
              {isLoadingActivities ? (
                <div className="text-center py-4">Loading activities...</div>
              ) : activities && activities.length > 0 ? (
                <ul className="space-y-4">
                  {activities.map((activity) => (
                    <ActivityItem key={activity.id} activity={activity} />
                  ))}
                </ul>
              ) : (
                <div className="text-center py-4">No recent activities.</div>
              )}
            </div>
          </div>
          
          {/* Pending approvals */}
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-neutral-200 flex justify-between items-center">
              <h2 className="font-semibold">Pending Approvals</h2>
              {approvals && approvals.length > 0 && (
                <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">{approvals.length}</span>
              )}
            </div>
            <div className="p-4">
              {isLoadingApprovals ? (
                <div className="text-center py-4">Loading approvals...</div>
              ) : approvals && approvals.length > 0 ? (
                <ul className="space-y-4">
                  {approvals.map((approval) => (
                    <ApprovalCard 
                      key={approval.id} 
                      approval={approval}
                      onApprove={() => handleApproval(approval.id, true)}
                      onReject={() => handleApproval(approval.id, false)}
                    />
                  ))}
                </ul>
              ) : (
                <div className="text-center py-4">No pending approvals.</div>
              )}
            </div>
          </div>
        </div>
        
        {/* Integration section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-lg">Service Integrations</h2>
            <Button size="sm" className="flex items-center gap-1">
              <i className="ri-add-line"></i>
              Add New
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {isLoadingIntegrations ? (
              <div className="col-span-full text-center py-4">Loading integrations...</div>
            ) : integrations && integrations.length > 0 ? (
              <>
                {integrations.map((integration) => (
                  <IntegrationCard key={integration.id} integration={integration} />
                ))}
                <div className="border border-neutral-200 border-dashed rounded-lg p-4 flex flex-col items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center mb-2">
                    <i className="ri-add-line text-neutral-500"></i>
                  </div>
                  <p className="text-sm text-neutral-500 mb-1">Connect New Service</p>
                  <p className="text-xs text-neutral-400 text-center">Add more integrations to enhance capabilities</p>
                </div>
              </>
            ) : (
              <div className="col-span-full">
                <div className="border border-neutral-200 border-dashed rounded-lg p-8 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
                    <i className="ri-link text-3xl text-neutral-500"></i>
                  </div>
                  <h3 className="text-lg font-medium text-neutral-600 mb-2">No Integrations Yet</h3>
                  <p className="text-neutral-500 text-center max-w-md mb-4">
                    Integrate with external services to enhance Rashed's capabilities and streamline your workflow.
                  </p>
                  <Button className="flex items-center gap-1">
                    <i className="ri-add-line"></i>
                    Connect First Service
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
  );
}
