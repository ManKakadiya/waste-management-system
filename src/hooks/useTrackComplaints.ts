
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
    staleTime: 0, // Ensure we always get fresh data
    refetchOnWindowFocus: true, // Refresh when window focuses
    refetchOnMount: true, // Refresh when component mounts
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

  // Delete complaint mutation - Enhanced to ensure permanent deletion
  const deleteComplaintMutation = useMutation({
    mutationFn: async (complaintId: string) => {
      if (!user?.id) throw new Error("User not authenticated");
      
      setIsDeleting(true);
      console.log("Starting deletion process for complaint:", complaintId);
      
      try {
        // First, get the complaint details to find associated images
        const { data: complaint, error: fetchError } = await supabase
          .from('complaints')
          .select('*')
          .eq('id', complaintId)
          .eq('user_id', user.id)
          .single();
        
        if (fetchError) {
          console.error("Error fetching complaint:", fetchError);
          throw fetchError;
        }
        
        console.log("Fetched complaint for deletion:", complaint);
        
        // Delete any associated images from storage
        if (complaint.image_url) {
          const imagePath = getStoragePathFromUrl(complaint.image_url);
          if (imagePath) {
            console.log("Deleting image from storage:", imagePath);
            const { error: deleteImageError } = await supabase.storage
              .from('waste-reports')
              .remove([imagePath]);
              
            if (deleteImageError) {
              console.error("Error deleting image:", deleteImageError);
              // Continue with deletion even if image deletion fails
            }
          }
        }
        
        if (complaint.after_image_url) {
          const afterImagePath = getStoragePathFromUrl(complaint.after_image_url);
          if (afterImagePath) {
            console.log("Deleting after image from storage:", afterImagePath);
            const { error: deleteAfterImageError } = await supabase.storage
              .from('waste-reports')
              .remove([afterImagePath]);
              
            if (deleteAfterImageError) {
              console.error("Error deleting after image:", deleteAfterImageError);
              // Continue with deletion even if image deletion fails
            }
          }
        }
        
        // Delete the complaint record from the database
        console.log("Deleting complaint record from database:", complaintId);
        const { error } = await supabase
          .from('complaints')
          .delete()
          .eq('id', complaintId)
          .eq('user_id', user.id);
        
        if (error) {
          console.error("Error deleting complaint from database:", error);
          throw error;
        }
        
        console.log("Complaint successfully deleted:", complaintId);
        return complaintId;
      } catch (error) {
        console.error("Error in delete process:", error);
        throw error;
      }
    },
    onSuccess: (complaintId) => {
      console.log("Delete mutation successful for complaint:", complaintId);
      
      // Update local state immediately
      queryClient.setQueryData(['user-complaints', user?.id], (oldData: any[]) => {
        return oldData ? oldData.filter(complaint => complaint.id !== complaintId) : [];
      });
      
      // Invalidate and refetch to ensure cache is updated
      queryClient.invalidateQueries({
        queryKey: ['user-complaints', user?.id]
      });
      
      // Force refetch to ensure we have latest data
      refetch();
      
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

  // Helper function to extract file path from storage URL
  const getStoragePathFromUrl = (url: string): string | null => {
    if (!url) return null;
    
    try {
      // Parse URL to extract file path
      const urlObj = new URL(url);
      // The path is after the bucket name in the URL
      const segments = urlObj.pathname.split('/');
      // Find the index of the bucket name
      const bucketIndex = segments.findIndex(segment => segment === 'waste-reports');
      
      if (bucketIndex !== -1 && bucketIndex < segments.length - 1) {
        // Join the segments after the bucket name to get the full path
        return segments.slice(bucketIndex + 1).join('/');
      }
      
      return null;
    } catch (error) {
      console.error("Failed to parse storage URL:", error);
      return null;
    }
  };

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
      console.log("Confirming deletion of complaint:", complaintToDelete);
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
