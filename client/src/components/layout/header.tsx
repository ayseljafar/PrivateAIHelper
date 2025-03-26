import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import NewProjectModal from "@/components/projects/new-project-modal";

interface HeaderProps {
  onMobileMenuToggle: () => void;
}

export default function Header({ onMobileMenuToggle }: HeaderProps) {
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const { user, logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="bg-white border-b border-neutral-200 py-2 px-4 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <button 
          className="lg:hidden p-2 rounded-md hover:bg-neutral-100 transition-colors"
          onClick={onMobileMenuToggle}
        >
          <i className="ri-menu-line text-xl"></i>
        </button>
        <Link href="/">
          <a className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center text-white font-bold">R</div>
            <h1 className="font-semibold text-xl">Rashed</h1>
          </a>
        </Link>
      </div>
      
      <div className="flex items-center space-x-4">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center space-x-1"
          onClick={() => setIsNewProjectModalOpen(true)}
        >
          <i className="ri-add-line"></i>
          <span>New Project</span>
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          aria-label="Toggle Dark Mode"
        >
          <i className="ri-moon-line"></i>
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full"
              aria-label="User Menu"
            >
              <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center">
                <i className="ri-user-line"></i>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span>{user?.name || user?.username}</span>
                <span className="text-xs text-muted-foreground">{user?.username}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <a className="w-full flex items-center cursor-pointer">
                  <i className="ri-settings-line mr-2"></i>
                  <span>Settings</span>
                </a>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/logs">
                <a className="w-full flex items-center cursor-pointer">
                  <i className="ri-file-list-line mr-2"></i>
                  <span>System Logs</span>
                </a>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-red-600 cursor-pointer" 
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
            >
              <i className="ri-logout-box-line mr-2"></i>
              <span>{logoutMutation.isPending ? "Logging out..." : "Logout"}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <NewProjectModal 
        isOpen={isNewProjectModalOpen} 
        onClose={() => setIsNewProjectModalOpen(false)} 
      />
    </header>
  );
}
