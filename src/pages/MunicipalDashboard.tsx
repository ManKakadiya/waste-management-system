
import { useState, useEffect } from "react";
import { Building } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useUserProfile } from "@/hooks/useUserProfile";

// Import refactored components
import DashboardLayout from "@/components/municipal/DashboardLayout";
import ComplaintFilter from "@/components/municipal/ComplaintFilter";
import ComplaintCard from "@/components/municipal/ComplaintCard";
import ComplaintDetailsDialog from "@/components/municipal/ComplaintDetailsDialog";
import ComplaintStatusDialog from "@/components/municipal/ComplaintStatusDialog";
import ComplaintListState from "@/components/municipal/ComplaintListState";
import AreaCodeMissing from "@/components/municipal/AreaCodeMissing";
import DashboardError from "@/components/municipal/DashboardError";
import { useComplaints } from "@/hooks/useComplaints";

const MunicipalDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // Use the user profile hook for consistent role and area code
  const { profile, isLoading: profileLoading } = useUserProfile(user);

  // Strict role check on component mount
  useEffect(() => {
    // Check if user is authorized (municipal or NGO)
    if (!user) {
      console.log("No user found, redirecting to auth page");
      navigate('/auth');
      return;
    }
    
    // Always use the role from the user object which comes from the database
    const userRole = user.user_metadata?.role || profile?.role;
    if (userRole !== 'municipal' && userRole !== 'ngo') {
      console.log("Access denied: User role", userRole, "tried to access municipal dashboard");
      navigate('/');
      toast({
        title: "Access restricted",
        description: "Only municipal or NGO accounts can access this dashboard.",
        variant: "destructive"
      });
    }
  }, [user, profile, navigate, toast]);

  // Ensure we have a valid area code from either profile or user object
  const areaCode = profile?.area_code || user?.user_metadata?.areaCode;
  console.log("Using area code for complaints:", areaCode);
  
  // If no area code is available, show an error message
  if (!profileLoading && !areaCode && user) {
    console.log("No area code found for user:", user.id);
    return (
      <DashboardLayout title="Municipal Waste Management Dashboard">
        <AreaCodeMissing />
      </DashboardLayout>
    );
  }

  // Use the custom hook for complaint management
  const {
    complaints,
    isLoading,
    complaintsError,
    selectedComplaint,
    setSelectedComplaint,
    dialogOpen,
    setDialogOpen,
    statusDialogOpen,
    setStatusDialogOpen,
    handleStatusChange,
    updateComplaintMutation,
    refetch
  } = useComplaints(areaCode, statusFilter);

  // Handle API errors
  if (complaintsError) {
    console.error("Error fetching complaints:", complaintsError);
    return (
      <DashboardLayout title="Municipal Waste Management Dashboard">
        <DashboardError error={complaintsError} />
      </DashboardLayout>
    );
  }

  // Filter complaints based on search query
  const filteredComplaints = Array.isArray(complaints) ? complaints.filter((complaint) => {
    if (!complaint) return false;
    
    const searchMatch = 
      (complaint.title?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (complaint.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (complaint.location?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (complaint.id?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (complaint.pincode?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
    
    return searchMatch;
  }) : [];

  // Always use account_type from the profile (database) for consistency
  const roleTitle = profile?.role === 'ngo' ? 'NGO Waste Management Dashboard' : 'Municipal Waste Management Dashboard';

  return (
    <DashboardLayout 
      title={roleTitle}
      subtitle={areaCode && (
        <div className="flex items-center mt-2 text-sm font-medium text-primary">
          <Building className="w-4 h-4 mr-1" />
          Managing Area: {areaCode} - {profile?.role === 'municipal' ? 'Municipal Corporation' : 'NGO'}
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
        isLoading={isLoading || profileLoading}
        isEmpty={!isLoading && !profileLoading && filteredComplaints.length === 0}
        areaCode={areaCode}
        onRefresh={refetch}
      />

      {/* Complaint Cards */}
      {!isLoading && !profileLoading && filteredComplaints.length > 0 && (
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
