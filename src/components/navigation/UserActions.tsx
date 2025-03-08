
import { Link, useLocation } from "react-router-dom";
import { LogIn, LogOut, Building, User, MapPinned } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

type UserActionsProps = {
  user: any;
  profile: any;
  isMunicipalOrNGO: boolean;
};

export const UserActions = ({ user, profile, isMunicipalOrNGO }: UserActionsProps) => {
  const location = useLocation();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (!user) {
    return (
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
    );
  }

  return (
    <>
      {/* Profile Link - Username only */}
      <Link
        to="/profile"
        className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105
          ${location.pathname === '/profile'
            ? "bg-white/20 text-white shadow-inner" 
            : "text-white/70 hover:text-white hover:bg-white/10"
          }`}
      >
        {isMunicipalOrNGO ? (
          <Building className="w-4 h-4 mr-1" />
        ) : (
          <User className="w-4 h-4 mr-1" />
        )}
        
        {/* Show username or area code */}
        <span className="inline text-sm">
          {profile?.username?.substring(0, 8) || user.username?.substring(0, 8) || 'User'}
          {profile?.area_code && isMunicipalOrNGO ? 
            <span className="ml-1 flex items-center">
              <MapPinned className="w-3 h-3 inline mr-0.5" />
              {profile.area_code}
            </span> : ''}
        </span>
      </Link>
      
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
  );
};
