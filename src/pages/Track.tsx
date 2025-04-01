
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/municipal/DashboardLayout";
import TrackHeader from "@/components/track/TrackHeader";
import EmptyState from "@/components/track/EmptyState";
import ComplaintCard from "@/components/track/ComplaintCard";
import ComplaintDetailsDialog from "@/components/track/ComplaintDetailsDialog";
import { useTrackComplaints } from "@/hooks/useTrackComplaints";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Track = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Redirect municipal/NGO users to dashboard
  useEffect(() => {
    if (user?.role === 'municipal' || user?.role === 'ngo') {
      toast({
        title: "Access restricted",
        description: "Municipal/NGO accounts should use the dashboard instead.",
        variant: "default",
      });
      navigate('/municipal-dashboard');
    }
  }, [user, navigate, toast]);

  const {
    searchQuery,
    setSearchQuery,
    complaints,
    isLoading,
    selectedComplaint,
    dialogOpen,
    handleViewDetails,
    handleCloseDialog,
    handleDeleteClick,
    deleteDialogOpen,
    handleConfirmDelete,
    handleCancelDelete,
    isDeleting
  } = useTrackComplaints();

  return (
    <DashboardLayout 
      title="Track Your Reports"
      subtitle="View and monitor the status of your submitted reports"
    >
      <TrackHeader 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery}
      />

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : user && complaints.length === 0 ? (
        <EmptyState 
          isSignedIn={!!user} 
          hasSearchQuery={!!searchQuery}
        />
      ) : !user ? (
        <EmptyState 
          isSignedIn={false} 
          hasSearchQuery={false}
        />
      ) : (
        <div className="grid gap-4">
          {complaints.map((complaint) => (
            <ComplaintCard
              key={complaint.id}
              complaint={complaint}
              onViewDetails={handleViewDetails}
              onDeleteClick={handleDeleteClick}
            />
          ))}
        </div>
      )}

      <ComplaintDetailsDialog
        complaint={selectedComplaint}
        isOpen={dialogOpen}
        onClose={handleCloseDialog}
      />
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={handleCancelDelete}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this complaint?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your complaint
              and remove the data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <span className="animate-spin mr-2">⟳</span> Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default Track;
