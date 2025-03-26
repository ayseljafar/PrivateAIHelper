import { Link } from "wouter";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Project } from "@shared/schema";
import { Badge } from "@/components/ui/badge";

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const getProjectTypeIcon = (type: string) => {
    switch (type) {
      case "Web Application":
        return "ri-window-line";
      case "API Service":
        return "ri-code-s-slash-line";
      case "Static Website":
        return "ri-pages-line";
      case "Mobile App":
        return "ri-smartphone-line";
      default:
        return "ri-folder-line";
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Unknown date";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center text-primary">
              <i className={getProjectTypeIcon(project.type)}></i>
            </div>
            <CardTitle className="text-lg">{project.name}</CardTitle>
          </div>
          <Badge variant="outline">{project.type}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-neutral-600 line-clamp-2 min-h-[2.5rem]">
          {project.description || "No description provided"}
        </p>
        
        <div className="mt-4 space-y-2">
          {project.techStack && project.techStack.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {project.techStack.map((tech, index) => (
                <Badge key={index} variant="secondary" className="bg-neutral-100 text-neutral-700">
                  {tech}
                </Badge>
              ))}
            </div>
          )}
          
          <div className="text-xs text-neutral-500">
            Created on {formatDate(project.createdAt)}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/projects/${project.id}`}>
            <a className="flex items-center gap-1">
              <i className="ri-eye-line"></i>
              View
            </a>
          </Link>
        </Button>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <i className="ri-code-line"></i>
            Code
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <i className="ri-rocket-line"></i>
            Deploy
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
