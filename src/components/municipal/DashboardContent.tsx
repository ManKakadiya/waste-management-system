
import ComplaintFilter from "@/components/municipal/ComplaintFilter";
import ComplaintCard from "@/components/municipal/ComplaintCard";
import ComplaintListState from "@/components/municipal/ComplaintListState";
import ComplaintDetailsDialog from "@/components/municipal/ComplaintDetailsDialog";
import ComplaintStatusDialog from "@/components/municipal/ComplaintStatusDialog";

interface DashboardContentProps {
  isLoading: boolean;
  profileLoading: boolean;
  filteredComplaints: any[];
  areaCode?: string;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string | null;
  setStatusFilter: (status: string | null) => void;
  complaintsData: any;
}

const DashboardContent = ({
  isLoading,
  profileLoading,
  filteredComplaints,
  areaCode,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  complaintsData
}: DashboardContentProps) => {
  const { 
    selectedComplaint,
    setSelectedComplaint,
    dialogOpen,
    setDialogOpen,
    statusDialogOpen,
    setStatusDialogOpen,
    handleStatusChange,
    updateComplaintMutation,
    refetch,
    complaintsError
  } = complaintsData;

  // Handle API errors
  if (complaintsError) {
    console.error("Error fetching complaints:", complaintsError);
    return <DashboardError error={complaintsError} />;
  }

  return (
    <>
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
    </>
  );
};

import DashboardError from "@/components/municipal/DashboardError";
export default DashboardContent;
