import { useState } from "react";
import { useLocation, Link } from "wouter";
import { logout, getUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function Header({ toggleSidebar }: { toggleSidebar: () => void }) {
  const [location] = useLocation();
  const { toast } = useToast();
  const user = getUser();
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur de déconnexion",
        description: "Une erreur s'est produite lors de la déconnexion.",
        variant: "destructive",
      });
    }
  };

  const getBreadcrumb = () => {
    if (location === "/") return "Dashboard";
    return location.substring(1).charAt(0).toUpperCase() + location.substring(2);
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-2">
          <button 
            onClick={toggleSidebar} 
            className="p-1 rounded-md hover:bg-gray-100"
            aria-label="Toggle sidebar"
          >
            <i className="fas fa-bars text-gray-600"></i>
          </button>
          <div className="text-sm breadcrumbs hidden sm:block">
            <ul className="flex space-x-2 text-gray-500">
              <li><Link href="/"><a className="hover:text-primary-600">Home</a></Link></li>
              <li className="before:content-['/'] before:mx-2">{getBreadcrumb()}</li>
            </ul>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <i className="fas fa-search text-gray-400"></i>
            </span>
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-gray-100 pl-10 pr-4 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white w-40 md:w-64"
            />
          </div>
          
          <div className="flex items-center space-x-3">
            <button className="relative p-1 rounded-full hover:bg-gray-100">
              <i className="fas fa-bell text-gray-600"></i>
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-destructive"></span>
            </button>
            
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-primary-700 flex items-center justify-center text-white">
                <span className="text-sm font-semibold">
                  {user?.prenom?.[0]?.toUpperCase() || "U"}
                </span>
              </div>
              <span className="text-sm font-medium hidden md:block">
                {user?.nom && user?.prenom ? `${user.prenom} ${user.nom}` : "Utilisateur"}
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700"
              >
                <i className="fas fa-sign-out-alt"></i>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
