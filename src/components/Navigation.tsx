
import { Link, useLocation } from "react-router-dom";
import { Home, ClipboardList, Info, Recycle } from "lucide-react";

const Navigation = () => {
  const location = useLocation();
  
  const links = [
    { path: "/", label: "Home", icon: Home },
    { path: "/report", label: "Report", icon: ClipboardList },
    { path: "/about", label: "About Us", icon: Info },
    { path: "/track", label: "Track", icon: Recycle },
  ];

  return (
    <nav className="bg-primary/95 backdrop-blur-sm sticky top-0 z-50 border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-white font-semibold text-lg">
            WMS
          </Link>
          
          <div className="flex space-x-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-1
                    ${isActive 
                      ? "bg-white/10 text-white" 
                      : "text-white/70 hover:text-white hover:bg-white/10"
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
