
import { Link, useLocation } from "react-router-dom";
import { Home, ClipboardList, Info, Recycle, BookOpen, LayoutDashboard } from "lucide-react";
import { useMemo } from "react";

type NavigationLinkProps = {
  user: any;
  isMunicipalOrNGO: boolean;
};

export const NavigationLinks = ({ user, isMunicipalOrNGO }: NavigationLinkProps) => {
  const location = useLocation();
  
  // Define links based on user role
  const links = useMemo(() => {
    const baseLinks = [
      { path: "/", label: "Home", icon: Home },
      { path: "/about", label: "About", icon: Info },
      { path: "/guide", label: "Guide", icon: BookOpen },
    ];
    
    if (!user) {
      return baseLinks;
    }
    
    if (isMunicipalOrNGO) {
      // For municipal/NGO users
      return [
        ...baseLinks,
        { path: "/municipal-dashboard", label: "Dashboard", icon: LayoutDashboard },
      ];
    } else {
      // For regular users
      return [
        ...baseLinks,
        { path: "/report", label: "Report", icon: ClipboardList },
        { path: "/track", label: "Track", icon: Recycle },
      ];
    }
  }, [user, isMunicipalOrNGO]);

  return (
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
  );
};
