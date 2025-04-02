
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useComplaints } from "@/hooks/useComplaints";

export const useMunicipalDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // Use the user profile hook for consistent role and area code
  const { 
    profile, 
    isLoading: profileLoading, 
    error: profileError, 
    role, 
    isMunicipalOrNGO 
  } = useUserProfile(user);

  // Strict role check on component mount with debounce to prevent multiple redirects
  useEffect(() => {
    // Check if user is logged in
    if (!user) {
      console.log("No user found, redirecting to auth page");
      navigate('/auth');
      return;
    }
    
    // Don't run the check until profile data is loaded
    if (profileLoading) {
      console.log("Profile still loading, deferring role check");
      return;
    }
    
    // Check if user is authorized (municipal or NGO)
    if (!isMunicipalOrNGO) {
      console.log("Access denied: User role", role, "tried to access municipal dashboard");
      
      // Set a flag to prevent showing the toast repeatedly during navigation
      if (!sessionStorage.getItem('municipal_access_denied')) {
        sessionStorage.setItem('municipal_access_denied', 'true');
        
        // Navigate away from this page
        navigate('/');
        
        // Show toast only once
        toast({
          title: "Access restricted",
          description: "Only municipal or NGO accounts can access this dashboard.",
          variant: "destructive"
        });
        
        // Clear flag after a delay
        setTimeout(() => {
          sessionStorage.removeItem('municipal_access_denied');
        }, 5000);
      }
    }
  }, [user, profileLoading, role, isMunicipalOrNGO, navigate, toast]);

  // Ensure we have a valid area code from the profile
  const areaCode = profile?.area_code;
  console.log("Using area code for complaints:", areaCode);

  // Use the custom hook for complaint management
  const complaintsData = useComplaints(areaCode, statusFilter);
  
  // Filter complaints based on search query
  const filteredComplaints = Array.isArray(complaintsData.complaints) 
    ? complaintsData.complaints.filter((complaint) => {
        if (!complaint) return false;
        
        const searchMatch = 
          (complaint.title?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
          (complaint.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
          (complaint.location?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
          (complaint.id?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
          (complaint.pincode?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
        
        return searchMatch;
      }) 
    : [];

  // Always use account_type from the profile (database) for consistency
  const roleTitle = role === 'ngo' ? 'NGO Waste Management Dashboard' : 'Municipal Waste Management Dashboard';

  return {
    user,
    profileLoading,
    profileError,
    profile,
    areaCode,
    role,
    roleTitle,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    filteredComplaints,
    complaintsData,
    isMunicipalOrNGO
  };
};

import { useState } from "react";
