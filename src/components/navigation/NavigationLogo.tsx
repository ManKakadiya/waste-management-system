
import { Link } from "react-router-dom";

type NavigationLogoProps = {
  isMobile: boolean;
};

export const NavigationLogo = ({ isMobile }: NavigationLogoProps) => {
  return (
    <Link to="/" className="flex items-center gap-2">
      <img 
        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSAFsirPMzSsyWkgK8P-qm9CoBy3M-eYkB8eQ&s" 
        alt="Waste Management Logo" 
        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full"
      />
      <span className="text-white font-semibold text-lg sm:text-xl tracking-tight hover:text-white/90 transition-colors duration-200">
         {isMobile ? '' : 'Waste Management System'}
      </span>
    </Link>
  );
};
