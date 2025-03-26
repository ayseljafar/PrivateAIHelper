import { Activity, Project } from "@shared/schema";
import { formatDistance } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

interface ActivityItemProps {
  activity: Activity;
}

export default function ActivityItem({ activity }: ActivityItemProps) {
  // Fetch project details if activity is related to a project
  const { data: project } = useQuery<Project>({
    queryKey: activity.projectId ? ['/api/projects', activity.projectId] : null,
    enabled: !!activity.projectId,
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "code_generation":
        return "ri-code-line";
      case "deployment":
        return "ri-rocket-line";
      case "integration":
        return "ri-link";
      case "optimization":
        return "ri-file-edit-line";
      case "error":
        return "ri-error-warning-line";
      default:
        return "ri-information-line";
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "code_generation":
        return "bg-primary-light bg-opacity-20 text-primary";
      case "deployment":
        return "bg-success bg-opacity-20 text-success";
      case "integration":
        return "bg-accent-light bg-opacity-20 text-accent";
      case "optimization":
        return "bg-warning bg-opacity-20 text-warning";
      case "error":
        return "bg-destructive bg-opacity-20 text-destructive";
      default:
        return "bg-secondary-light bg-opacity-20 text-secondary";
    }
  };

  const getActivityAction = (type: string, metadata: any) => {
    switch (type) {
      case "code_generation":
        return {
          label: "View code",
          href: `/projects/${activity.projectId}/code/${metadata?.fileId || ''}`,
        };
      case "deployment":
        return {
          label: "View logs",
          href: `/deployments/${metadata?.deploymentId || ''}`,
        };
      case "integration":
        return {
          label: "View details",
          href: `/integrations/${metadata?.integrationId || ''}`,
        };
      case "optimization":
        return {
          label: "Review & approve",
          href: `/approvals/${metadata?.approvalId || ''}`,
        };
      default:
        return {
          label: "View details",
          href: `/activities/${activity.id}`,
        };
    }
  };

  const timeAgo = activity.timestamp 
    ? formatDistance(new Date(activity.timestamp), new Date(), { addSuffix: true })
    : 'recently';

  const action = activity.metadata ? getActivityAction(activity.type, activity.metadata) : null;

  return (
    <li className="flex space-x-3">
      <div className={`flex-shrink-0 w-10 h-10 rounded-full ${getActivityColor(activity.type)} flex items-center justify-center`}>
        <i className={getActivityIcon(activity.type)}></i>
      </div>
      <div className="flex-1">
        <p className="text-sm mb-1">{activity.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-xs text-neutral-500">
            {project?.name ? `${project.name} • ` : ''}{timeAgo}
          </span>
          {action && (
            <Button variant="link" size="sm" className="h-auto p-0" asChild>
              <Link href={action.href}>
                <a className="text-xs text-primary">{action.label}</a>
              </Link>
            </Button>
          )}
        </div>
      </div>
    </li>
  );
}
