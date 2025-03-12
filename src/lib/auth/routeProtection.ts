
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { validateRole } from './types';
import { AuthUser } from '@/lib/auth';

export const useRouteProtection = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Redirect based on user role - only for initial login
  const redirectBasedOnRole = (role: string | undefined) => {
    const validRole = validateRole(role || 'user');
    console.log("Redirecting based on role:", validRole);
    
    // Avoid redirecting if already on a suitable page
    const pathname = window.location.pathname;
    
    if (validRole === 'municipal' || validRole === 'ngo') {
      if (pathname !== '/municipal-dashboard') {
        console.log(`Redirecting ${validRole} user to dashboard`);
        navigate('/municipal-dashboard');
      }
    } else if (pathname === '/auth') {
      console.log('Redirecting regular user to home');
      navigate('/');
    }
  };
  
  // Unified route protection - checks if current page is allowed
  const protectRoutes = (pathname: string, user: AuthUser) => {
    if (!user) {
      // If not logged in, only allow access to public routes
      if (['/report', '/track', '/municipal-dashboard', '/profile'].includes(pathname)) {
        console.log("Auth required, redirecting to auth page");
        navigate('/auth');
        toast({
          title: "Authentication required",
          description: "Please sign in to access this page.",
          variant: "destructive"
        });
      }
      return;
    }
    
    // Always determine role from user object, which gets it from profile
    const userRole = user.role || 'user';
    const isMunicipalOrNGO = userRole === 'municipal' || userRole === 'ngo';
    console.log("Route protection - User role:", userRole, "Is Municipal/NGO:", isMunicipalOrNGO);
    
    // Protect municipal dashboard from regular users
    if (!isMunicipalOrNGO && pathname === '/municipal-dashboard') {
      console.log("Regular user tried to access municipal dashboard");
      navigate('/');
      toast({
        title: "Access denied",
        description: "Only municipal or NGO accounts can access this dashboard.",
        variant: "destructive"
      });
      return;
    }
    
    // Redirect municipal/NGO users from user-specific pages
    if (isMunicipalOrNGO && (pathname === '/report' || pathname === '/track')) {
      console.log("Municipal/NGO tried to access user page");
      navigate('/municipal-dashboard');
      toast({
        title: "Access restricted",
        description: "Please use the dashboard for your account type.",
        variant: "destructive"
      });
      return;
    }
  };
  
  return { redirectBasedOnRole, protectRoutes };
};
