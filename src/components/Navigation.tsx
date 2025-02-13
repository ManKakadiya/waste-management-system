import { Link, useLocation } from "react-router-dom";
import { Home, ClipboardList, Info, Recycle, BookOpen, LogIn, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { useQuery } from "@tanstack/react-query";

const Navigation = () => {
  const location = useLocation();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

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
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img 
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSAFsirPMzSsyWkgK8P-qm9CoBy3M-eYkB8eQ&s" 
              alt="Waste Management Logo" 
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full"
            />
            <span className="text-white font-semibold text-lg sm:text-xl tracking-tight hover:text-white/90 transition-colors duration-200">
            </span>
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
            
            <div className="ml-0.5 sm:ml-2 flex items-center gap-2">
              {user ? (
                <>
                  <div className="hidden sm:flex items-center gap-2 px-2 py-1 rounded-lg bg-white/10">
                    <User className="w-4 h-4 text-white/70" />
                    <span className="text-sm text-white">
                      {profile?.username || 'User'}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    className="text-white/70 hover:text-white hover:bg-white/10"
                  >
                    <LogOut className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Sign Out</span>
                  </Button>
                </>
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
