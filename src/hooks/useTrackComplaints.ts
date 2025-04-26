
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useFetchComplaints } from "./useFetchComplaints";
import { useDeleteComplaint } from "./useDeleteComplaint";

export const useTrackComplaints = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [complaintToDelete, setComplaintToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [localComplaints, setLocalComplaints] = useState<any[]>([]);

  const { data: complaints = [], isLoading, refetch } = useFetchComplaints();

  useEffect(() => {
    if (complaints) {
      setLocalComplaints(complaints);
    }
  }, [complaints]);

  const handleRefresh = async () => {
    if (!user?.id) return;
    
    setIsRefreshing(true);
    try {
      await refetch();
      toast({
        title: "Refreshed",
        description: "Complaint list has been refreshed.",
        variant: "success",
      });
    } catch (error) {
      console.error("Error refreshing complaints:", error);
      toast({
        title: "Refresh Failed",
        description: "There was an error refreshing the complaints list.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const deleteComplaintMutation = useDeleteComplaint((complaintId) => {
    setLocalComplaints(prev => prev.filter(complaint => complaint.id !== complaintId));
    setDeleteDialogOpen(false);
    setComplaintToDelete(null);
    setIsDeleting(false);
    
    if (selectedComplaint && selectedComplaint.id === complaintId) {
      setDialogOpen(false);
      setSelectedComplaint(null);
    }
  });

  const filteredComplaints = localComplaints.filter((complaint) =>
    complaint.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    complaint.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    complaint.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    complaint.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewDetails = (complaint: any) => {
    setSelectedComplaint(complaint);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };
  
  const handleDeleteClick = (complaintId: string) => {
    setComplaintToDelete(complaintId);
    setDeleteDialogOpen(true);
  };
  
  const handleConfirmDelete = () => {
    if (complaintToDelete) {
      console.log("Confirming deletion of complaint:", complaintToDelete);
      setLocalComplaints(prev => prev.filter(complaint => complaint.id !== complaintToDelete));
      deleteComplaintMutation.mutate(complaintToDelete);
    }
  };
  
  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setComplaintToDelete(null);
  };

  return {
    user,
    searchQuery,
    setSearchQuery,
    complaints: filteredComplaints,
    isLoading,
    isRefreshing,
    selectedComplaint,
    dialogOpen,
    handleViewDetails,
    handleCloseDialog,
    handleDeleteClick,
    deleteDialogOpen,
    handleConfirmDelete,
    handleCancelDelete,
    isDeleting,
    handleRefresh
  };
};
