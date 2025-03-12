
import { useState, useEffect } from "react";
import { Building } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

// Import refactored components
import DashboardLayout from "@/components/municipal/DashboardLayout";
import ComplaintFilter from "@/components/municipal/ComplaintFilter";
import ComplaintCard from "@/components/municipal/ComplaintCard";
import ComplaintDetailsDialog from "@/components/municipal/ComplaintDetailsDialog";
import ComplaintStatusDialog from "@/components/municipal/ComplaintStatusDialog";
import ComplaintListState from "@/components/municipal/ComplaintListState";
import { useComplaints } from "@/hooks/useComplaints";

const MunicipalDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // Strict role check on component mount
  useEffect(() => {
    // Check if user is authorized (municipal or NGO)
    if (!user) {
      console.log("No user found, redirecting to auth page");
      navigate('/auth');
      return;
    }
    
    // Always use the role from the user object which comes from the database
    if (user.role !== 'municipal' && user.role !== 'ngo') {
      console.log("Access denied: User role", user.role, "tried to access municipal dashboard");
      navigate('/');
      toast({
        title: "Access restricted",
        description: "Only municipal or NGO accounts can access this dashboard.",
        variant: "destructive"
      });
    }
  }, [user, navigate, toast]);

  // Fetch profile to get area code
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        console.log("No user ID available for profile fetch");
        return null;
      }
      
      console.log("Fetching profile for user:", user.id);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('area_code, account_type, username')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error("Error fetching profile:", error);
        throw error;
      }
      
      console.log("Profile fetched successfully:", data);
      
      // Double-check role consistency
      if (data && (data.account_type !== user.role)) {
        console.warn("Role mismatch detected:", {
          userRole: user.role,
          profileRole: data.account_type
        });
      }
      
      return data;
    },
    enabled: !!user?.id,
  });

  const areaCode = profile?.area_code || user?.areaCode;
  console.log("Using area code for complaints:", areaCode);

  // Use the custom hook for complaint management
  const {
    complaints,
    isLoading: complaintsLoading,
    selectedComplaint,
    setSelectedComplaint,
    dialogOpen,
    setDialogOpen,
    statusDialogOpen,
    setStatusDialogOpen,
    handleStatusChange,
    updateComplaintMutation
  } = useComplaints(areaCode, statusFilter);

  // Filter complaints based on search query
  const filteredComplaints = complaints.filter((complaint) => {
    if (!complaint) return false;
    
    const searchMatch = 
      (complaint.title?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (complaint.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (complaint.location?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (complaint.id?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (complaint.pincode?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
    
    return searchMatch;
  });

  const isLoading = profileLoading || complaintsLoading;

  // Always use account_type from the profile (database) for consistency
  const roleTitle = profile?.account_type === 'ngo' ? 'NGO Waste Management Dashboard' : 'Municipal Waste Management Dashboard';

  return (
    <DashboardLayout 
      title={roleTitle}
      subtitle={areaCode && (
        <div className="flex items-center mt-2 text-sm font-medium text-primary">
          <Building className="w-4 h-4 mr-1" />
          Managing Area: {areaCode} - {profile?.account_type === 'municipal' ? 'Municipal Corporation' : 'NGO'}
        </div>
      )}
    >
      {/* Search and Filter */}
      <ComplaintFilter 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      {/* Loading and Empty States */}
      <ComplaintListState 
        isLoading={isLoading}
        isEmpty={filteredComplaints.length === 0}
        areaCode={areaCode}
      />

      {/* Complaint Cards */}
      {!isLoading && filteredComplaints.length > 0 && (
        <div className="grid gap-4">
          {filteredComplaints.map((complaint) => (
            <ComplaintCard
              key={complaint.id}
              complaint={complaint}
              onViewDetails={() => {
                setSelectedComplaint(complaint);
                setDialogOpen(true);
              }}
              onUpdateStatus={() => {
                setSelectedComplaint(complaint);
                setStatusDialogOpen(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Dialogs */}
      <ComplaintDetailsDialog 
        complaint={selectedComplaint} 
        isOpen={dialogOpen} 
        setIsOpen={setDialogOpen} 
      />
      
      <ComplaintStatusDialog 
        complaint={selectedComplaint}
        isOpen={statusDialogOpen}
        setIsOpen={setStatusDialogOpen}
        onStatusChange={handleStatusChange}
        isPending={updateComplaintMutation.isPending}
      />
    </DashboardLayout>
  );
};

export default MunicipalDashboard;
