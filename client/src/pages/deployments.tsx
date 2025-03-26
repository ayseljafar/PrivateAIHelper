import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Deployment, Environment, Project } from "@shared/schema";
import DeploymentItem from "@/components/deployments/deployment-item";
import EnvironmentCard from "@/components/deployments/environment-card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Deployments() {
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const perPage = 4;

  const { data: deployments, isLoading: isLoadingDeployments } = useQuery<Deployment[]>({
    queryKey: ['/api/deployments'],
  });

  const { data: environments, isLoading: isLoadingEnvironments } = useQuery<Environment[]>({
    queryKey: ['/api/environments'],
  });

  const { data: projects } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });

  const filteredDeployments = deployments?.filter(deployment => 
    projectFilter === "all" || deployment.projectId.toString() === projectFilter
  );

  const totalPages = filteredDeployments 
    ? Math.ceil(filteredDeployments.length / perPage) 
    : 0;

  const paginatedDeployments = filteredDeployments?.slice(
    (page - 1) * perPage, 
    page * perPage
  );

  const getProjectName = (projectId: number) => {
    return projects?.find(p => p.id === projectId)?.name || "Unknown Project";
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Deployments</h1>
        <p className="text-neutral-600">Manage and monitor your project deployments.</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden mb-8">
        <div className="px-4 py-3 border-b border-neutral-200 bg-neutral-50 flex justify-between items-center">
          <h2 className="font-semibold">Deployment History</h2>
          <div className="flex items-center space-x-2">
            <Select value={projectFilter} onValueChange={setProjectFilter}>
              <SelectTrigger className="h-9 w-[180px]">
                <SelectValue placeholder="All Projects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects?.map(project => (
                  <SelectItem key={project.id} value={project.id.toString()}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" className="flex items-center gap-1">
              <i className="ri-add-line"></i>
              New Deployment
            </Button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {isLoadingDeployments ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-2 text-neutral-500">Loading deployments...</p>
            </div>
          ) : paginatedDeployments && paginatedDeployments.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200">
                  <th className="text-left text-sm font-semibold text-neutral-700 px-4 py-3">Project</th>
                  <th className="text-left text-sm font-semibold text-neutral-700 px-4 py-3">Environment</th>
                  <th className="text-left text-sm font-semibold text-neutral-700 px-4 py-3">Status</th>
                  <th className="text-left text-sm font-semibold text-neutral-700 px-4 py-3">Deployed At</th>
                  <th className="text-left text-sm font-semibold text-neutral-700 px-4 py-3">Deployed By</th>
                  <th className="text-left text-sm font-semibold text-neutral-700 px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedDeployments.map((deployment) => (
                  <DeploymentItem 
                    key={deployment.id} 
                    deployment={deployment} 
                    projectName={getProjectName(deployment.projectId)}
                  />
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8">
              <p className="text-neutral-500">No deployments found.</p>
            </div>
          )}
        </div>
        
        {totalPages > 0 && (
          <div className="px-4 py-3 border-t border-neutral-200 bg-neutral-50 flex justify-between items-center">
            <p className="text-sm text-neutral-500">
              Showing {((page - 1) * perPage) + 1} to {Math.min(page * perPage, filteredDeployments?.length || 0)} of {filteredDeployments?.length || 0} deployments
            </p>
            <div className="flex space-x-1">
              <Button 
                variant="outline" 
                size="icon" 
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                <i className="ri-arrow-left-s-line"></i>
              </Button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                <Button 
                  key={pageNum}
                  variant={pageNum === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPage(pageNum)}
                >
                  {pageNum}
                </Button>
              ))}
              
              <Button 
                variant="outline" 
                size="icon"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                <i className="ri-arrow-right-s-line"></i>
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {/* Deployment Environments */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-neutral-200">
          <h2 className="font-semibold">Deployment Environments</h2>
        </div>
        
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoadingEnvironments ? (
            <div className="col-span-full text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-2 text-neutral-500">Loading environments...</p>
            </div>
          ) : environments && environments.length > 0 ? (
            <>
              {environments.map((environment) => (
                <EnvironmentCard key={environment.id} environment={environment} />
              ))}
              
              <div className="border border-neutral-200 border-dashed rounded-lg p-4 flex flex-col items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center mb-2">
                  <i className="ri-add-line text-neutral-500"></i>
                </div>
                <p className="text-sm text-neutral-500 mb-1">Add New Environment</p>
                <p className="text-xs text-neutral-400 text-center">Configure a new deployment target</p>
              </div>
            </>
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-neutral-500">No environments configured.</p>
              <Button className="mt-4">Add First Environment</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
