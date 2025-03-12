
import { useState, useEffect } from "react";
import { Building } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useUserProfile } from "@/hooks/useUserProfile";

// Import refactored components
import DashboardLayout from "@/components/municipal/DashboardLayout";
import ComplaintFilter from "@/components/municipal/ComplaintFilter";
import ComplaintCard from "@/components/municipal/ComplaintCard";
import ComplaintDetailsDialog from "@/components/municipal/ComplaintDetailsDialog";
import ComplaintStatusDialog from "@/components/municipal/ComplaintStatusDialog";
import ComplaintListState from "@/components/municipal/ComplaintListState";
import { useComplaints } from "@/hooks/useComplaints";
import { Card } from "@/components/ui/card";

const MunicipalDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // Use the user profile hook for consistent role and area code
  const { profile } = useUserProfile(user);

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

  // Ensure we have a valid area code from either profile or user object
  const areaCode = profile?.area_code || user?.areaCode;
  console.log("Using area code for complaints:", areaCode);
  
  // If no area code is available, show an error message
  if (!areaCode && user) {
    console.log("No area code found for user:", user.id);
    return (
      <DashboardLayout title="Municipal Waste Management Dashboard">
        <Card className="p-8 text-center">
          <h3 className="text-xl font-bold mb-2">Missing Area Code</h3>
          <p className="text-gray-500 mb-4">
            Your account doesn't have an area code assigned. Please update your profile
            or contact the administrator.
          </p>
          <button 
            className="bg-primary text-white px-4 py-2 rounded"
            onClick={() => navigate('/profile')}
          >
            Update Profile
          </button>
        </Card>
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
    updateComplaintMutation
  } = useComplaints(areaCode, statusFilter);

  // Handle API errors
  if (complaintsError) {
    console.error("Error fetching complaints:", complaintsError);
    return (
      <DashboardLayout title="Municipal Waste Management Dashboard">
        <Card className="p-8 text-center">
          <h3 className="text-xl font-bold mb-2">Error Loading Complaints</h3>
          <p className="text-gray-500">
            There was a problem loading complaints. Please try again later or contact support.
          </p>
          <button 
            className="bg-primary text-white px-4 py-2 rounded mt-4"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </Card>
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
        isLoading={isLoading}
        isEmpty={!isLoading && filteredComplaints.length === 0}
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
