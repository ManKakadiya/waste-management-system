
import { Link, useLocation } from "react-router-dom";
import { Home, ClipboardList, Info, Recycle, BookOpen, LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";

const Navigation = () => {
  const location = useLocation();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  
  const links = [
    { path: "/", label: "Home", icon: Home },
    { path: "/report", label: "Report", icon: ClipboardList },
    { path: "/track", label: "Track", icon: Recycle },
    { path: "/guide", label: "Guide", icon: BookOpen },
    { path: "/about", label: "About", icon: Info },
  ];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <nav className="bg-primary/95 backdrop-blur-sm sticky top-0 z-50 border-b border-white/10 shadow-lg">
      <div className="max-w-6xl mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <Link 
            to="/" 
            className="text-white font-semibold text-lg sm:text-xl tracking-tight hover:text-white/90 transition-colors duration-200 whitespace-nowrap overflow-hidden"
          >
            {isMobile ? 'WMS' : 'Waste Management System'}
          </Link>
          
          <div className="flex items-center">
            <div className="flex items-center gap-0.5 sm:gap-2">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1 hover:scale-105
                      ${isActive 
                        ? "bg-white/20 text-white shadow-inner" 
                        : "text-white/70 hover:text-white hover:bg-white/10"
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{link.label}</span>
                  </Link>
                );
              })}
            </div>
            
            <div className="ml-0.5 sm:ml-2">
              {user ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="text-white/70 hover:text-white hover:bg-white/10"
                >
                  <LogOut className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Sign Out</span>
                </Button>
              ) : (
                <Link to="/auth">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white/70 hover:text-white hover:bg-white/10"
                  >
                    <LogIn className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Sign In</span>
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
