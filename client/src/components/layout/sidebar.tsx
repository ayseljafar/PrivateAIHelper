import { Link, useLocation } from "wouter";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Project } from "@shared/schema";

interface SidebarProps {
  collapsed?: boolean;
}

export default function Sidebar({ collapsed = false }: SidebarProps) {
  const [location] = useLocation();
  const [apiUsage, setApiUsage] = useState(64);

  const { data: recentProjects } = useQuery<Project[]>({
    queryKey: ['/api/projects/recent'],
  });

  const { data: approvalCount } = useQuery<number>({
    queryKey: ['/api/approvals/count'],
  });

  const mainNavItems = [
    { path: "/", icon: "ri-dashboard-line", label: "Dashboard" },
    { path: "/chat", icon: "ri-chat-3-line", label: "Chat" },
    { path: "/projects", icon: "ri-folder-line", label: "Projects" },
    { path: "/deployments", icon: "ri-rocket-line", label: "Deployments" },
    { path: "/integrations", icon: "ri-link", label: "Integrations" },
  ];

  const adminNavItems = [
    { path: "/logs", icon: "ri-file-list-line", label: "Logs" },
    { path: "/approvals", icon: "ri-check-double-line", label: "Approvals", badge: approvalCount },
    { path: "/settings", icon: "ri-settings-line", label: "Settings" },
  ];

  return (
    <aside className="w-64 bg-white border-r border-neutral-200 flex-shrink-0 h-full">
      <ScrollArea className="h-full">
        <nav className="p-4">
          <div className="mb-6">
            <h2 className="text-xs font-semibold uppercase text-neutral-500 mb-2 px-2">Main Navigation</h2>
            <ul className="space-y-1">
              {mainNavItems.map((item) => (
                <li key={item.path}>
                  <Link href={item.path}>
                    <a className={`flex items-center space-x-2 px-2 py-2 rounded-md ${
                      location === item.path 
                        ? "bg-primary text-white hover:bg-primary-dark" 
                        : "hover:bg-neutral-100"
                      } transition-colors`}
                    >
                      <i className={item.icon}></i>
                      <span>{item.label}</span>
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="mb-6">
            <h2 className="text-xs font-semibold uppercase text-neutral-500 mb-2 px-2">Admin</h2>
            <ul className="space-y-1">
              {adminNavItems.map((item) => (
                <li key={item.path}>
                  <Link href={item.path}>
                    <a className={`flex items-center space-x-2 px-2 py-2 rounded-md ${
                      location === item.path 
                        ? "bg-primary text-white hover:bg-primary-dark" 
                        : "hover:bg-neutral-100"
                      } transition-colors`}
                    >
                      <i className={item.icon}></i>
                      <span>{item.label}</span>
                      {item.badge && item.badge > 0 && (
                        <span className="ml-auto bg-primary text-white text-xs px-1.5 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="mb-4">
            <h2 className="text-xs font-semibold uppercase text-neutral-500 mb-2 px-2">Recent Projects</h2>
            <ul className="space-y-1">
              {recentProjects && recentProjects.length > 0 ? (
                recentProjects.map((project) => (
                  <li key={project.id}>
                    <Link href={`/projects/${project.id}`}>
                      <a className="flex items-center space-x-2 px-2 py-2 rounded-md hover:bg-neutral-100 transition-colors text-sm">
                        <i className="ri-folder-line text-neutral-400"></i>
                        <span className="truncate">{project.name}</span>
                      </a>
                    </Link>
                  </li>
                ))
              ) : (
                <li className="px-2 py-2 text-sm text-neutral-500">No recent projects</li>
              )}
            </ul>
          </div>
        </nav>
        
        {/* System status */}
        <div className="mt-auto p-4 border-t border-neutral-200">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-neutral-500">System Status</span>
            <span className="flex items-center text-success">
              <span className="w-2 h-2 bg-success rounded-full mr-1.5"></span>
              Healthy
            </span>
          </div>
          <div className="text-xs text-neutral-500">
            <div className="flex justify-between mb-1">
              <span>API Usage</span>
              <span>{apiUsage}%</span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-1.5">
              <div 
                className="bg-secondary h-1.5 rounded-full" 
                style={{ width: `${apiUsage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
}
