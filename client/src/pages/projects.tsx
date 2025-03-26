import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Project } from "@shared/schema";
import ProjectCard from "@/components/projects/project-card";
import NewProjectModal from "@/components/projects/new-project-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Projects() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });

  const filteredProjects = projects?.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFilter = filterType === "all" || project.type === filterType;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">Projects</h1>
            <p className="text-neutral-600">Manage your development projects</p>
          </div>
          <Button 
            onClick={() => setIsModalOpen(true)} 
            className="flex items-center gap-1 whitespace-nowrap"
          >
            <i className="ri-add-line"></i>
            New Project
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-1 md:col-span-2">
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Web Application">Web Application</SelectItem>
              <SelectItem value="API Service">API Service</SelectItem>
              <SelectItem value="Static Website">Static Website</SelectItem>
              <SelectItem value="Mobile App">Mobile App</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : filteredProjects && filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-neutral-200">
          <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4">
            <i className="ri-folder-line text-2xl text-neutral-500"></i>
          </div>
          <h3 className="text-lg font-medium text-neutral-700 mb-2">
            {searchQuery || filterType !== "all" 
              ? "No projects match your filters" 
              : "No projects yet"}
          </h3>
          <p className="text-neutral-500 max-w-md mx-auto mb-6">
            {searchQuery || filterType !== "all" 
              ? "Try adjusting your search or filter criteria." 
              : "Create your first project to get started with Rashed."}
          </p>
          {!searchQuery && filterType === "all" && (
            <Button onClick={() => setIsModalOpen(true)}>
              Create First Project
            </Button>
          )}
        </div>
      )}

      <NewProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
