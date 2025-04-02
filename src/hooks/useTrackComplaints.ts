
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

export const useTrackComplaints = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [complaintToDelete, setComplaintToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch user's complaints
  const { data: complaints = [], isLoading, refetch } = useQuery({
    queryKey: ['user-complaints', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Refresh complaints function
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

  // Delete complaint mutation
  const deleteComplaintMutation = useMutation({
    mutationFn: async (complaintId: string) => {
      if (!user?.id) throw new Error("User not authenticated");
      
      setIsDeleting(true);
      
      const { error } = await supabase
        .from('complaints')
        .delete()
        .eq('id', complaintId)
        .eq('user_id', user.id); // Security: ensure user can only delete their own complaints
      
      if (error) {
        console.error("Error deleting complaint:", error);
        throw error;
      }
      return complaintId;
    },
    onSuccess: (complaintId) => {
      queryClient.invalidateQueries({ queryKey: ['user-complaints', user?.id] });
      
      toast({
        title: "Complaint Deleted",
        description: "Your complaint has been successfully deleted.",
        variant: "success",
      });
      
      setDeleteDialogOpen(false);
      setComplaintToDelete(null);
      setIsDeleting(false);
      
      // If the deleted complaint was selected, close the details dialog
      if (selectedComplaint && selectedComplaint.id === complaintId) {
        setDialogOpen(false);
        setSelectedComplaint(null);
      }
    },
    onError: (error) => {
      console.error("Error deleting complaint:", error);
      
      toast({
        title: "Deletion Failed",
        description: "There was an error deleting your complaint. Please try again.",
        variant: "destructive",
      });
      
      setIsDeleting(false);
    }
  });

  const filteredComplaints = complaints.filter((complaint) =>
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
