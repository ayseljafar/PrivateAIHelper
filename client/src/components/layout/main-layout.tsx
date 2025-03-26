import { useState } from "react";
import Header from "./header";
import Sidebar from "./sidebar";
import { Sheet, SheetContent } from "@/components/ui/sheet";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="flex flex-col h-screen">
      <Header onMobileMenuToggle={toggleMobileMenu} />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block h-full">
          <Sidebar />
        </div>
        
        {/* Mobile Sidebar Sheet */}
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetContent side="left" className="p-0 w-[80%] max-w-[300px]">
            <Sidebar />
          </SheetContent>
        </Sheet>
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-neutral-50 scrollbar-thin">
          {children}
        </main>
      </div>
    </div>
  );
}
