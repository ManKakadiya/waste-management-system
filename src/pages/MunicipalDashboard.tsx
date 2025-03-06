
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

  useEffect(() => {
    // Check if user is authorized (municipal or NGO)
    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (user.role !== 'municipal' && user.role !== 'ngo') {
      navigate('/');
      toast({
        title: "Access restricted",
        description: "Only municipal or NGO accounts can access this dashboard.",
        variant: "destructive"
      });
    }
  }, [user, navigate, toast]);

  // Fetch profile to get area code
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('area_code, account_type, username')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Use the custom hook for complaint management
  const {
    complaints,
    isLoading,
    selectedComplaint,
    setSelectedComplaint,
    dialogOpen,
    setDialogOpen,
    statusDialogOpen,
    setStatusDialogOpen,
    handleStatusChange,
    updateComplaintMutation
  } = useComplaints(profile?.area_code, statusFilter);

  // Filter complaints based on search query
  const filteredComplaints = complaints.filter((complaint) => {
    const searchMatch = 
      complaint.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.pincode.toLowerCase().includes(searchQuery.toLowerCase());
    
    return searchMatch;
  });

  const roleTitle = profile?.account_type === 'ngo' ? 'NGO Waste Management Dashboard' : 'Municipal Waste Management Dashboard';

  return (
    <DashboardLayout 
      title={roleTitle}
      subtitle={profile?.area_code && (
        <div className="flex items-center mt-2 text-sm font-medium text-primary">
          <Building className="w-4 h-4 mr-1" />
          Managing Area: {profile.area_code} - {profile?.account_type === 'municipal' ? 'Municipal Corporation' : 'NGO'}
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
        areaCode={profile?.area_code}
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
