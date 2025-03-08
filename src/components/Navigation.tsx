
import { useAuth } from "@/lib/auth";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUserProfile } from "@/hooks/useUserProfile";
import { NavigationLogo } from "./navigation/NavigationLogo";
import { NavigationLinks } from "./navigation/NavigationLinks";
import { UserActions } from "./navigation/UserActions";

const Navigation = () => {
  const { user, loading } = useAuth();
  const isMobile = useIsMobile();
  const { profile, isMunicipalOrNGO } = useUserProfile(user);

  return (
    <nav className="bg-primary/95 backdrop-blur-sm sticky top-0 z-50 border-b border-white/10 shadow-lg">
      <div className="max-w-6xl mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <NavigationLogo isMobile={isMobile} />
          
          <div className="flex items-center">
            {/* Navigation Links */}
            <NavigationLinks user={user} isMunicipalOrNGO={isMunicipalOrNGO} />
            
            {/* User Actions */}
            <div className="ml-0.5 sm:ml-2 flex items-center gap-2">
              <UserActions 
                user={user} 
                profile={profile} 
                isMunicipalOrNGO={isMunicipalOrNGO} 
              />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
