import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { decode } from "@/utils/complaintUtils";
import { uploadImage } from "@/integrations/supabase/storage";

export const useComplaints = (areaCode: string | undefined, statusFilter: string | null) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);

  const { 
    data: complaints = [], 
    isLoading, 
    error: complaintsError,
    refetch
  } = useQuery({
    queryKey: ['complaints', areaCode, statusFilter],
    queryFn: async () => {
      if (!areaCode) {
        console.log("No area code provided, cannot fetch complaints");
        return [];
      }
      
      console.log("Fetching complaints for area code:", areaCode);
      
      try {
        let query = supabase
          .from('complaints')
          .select('*')
          .eq('pincode', areaCode);
        
        if (statusFilter) {
          query = query.eq('status', statusFilter);
        }
        
        const { data, error } = await query.order('created_at', { ascending: false });
        
        if (error) {
          console.error("Error fetching complaints:", error);
          throw error;
        }
        
        console.log("Fetched complaints:", data?.length || 0);
        if (data?.length === 0) {
          console.log("No complaints found for area code:", areaCode);
        }
        
        return data || [];
      } catch (error) {
        console.error("Exception in complaint fetch:", error);
        throw error;
      }
    },
    enabled: !!areaCode,
    retry: 3,
    retryDelay: attempt => Math.min(attempt > 1 ? 2000 : 1000, 30 * 1000),
  });

  const updateComplaintMutation = useMutation({
    mutationFn: async ({ id, status, afterImageUrl }: { id: string, status: string, afterImageUrl?: string }) => {
      console.log(`Updating complaint ${id} to status ${status} with afterImageUrl: ${afterImageUrl ? 'provided' : 'not provided'}`);
      
      const updateData: any = { status };
      
      if (afterImageUrl) {
        updateData.after_image_url = afterImageUrl;
      }
      
      const { data, error } = await supabase
        .from('complaints')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error(`Error updating complaint status: ${error.message}`, error);
        throw error;
      }
      
      console.log(`Successfully updated complaint ${id} to status ${status}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      toast({
        title: "Status Updated",
        description: `Complaint status has been updated successfully.`,
        variant: "success",
      });
      setStatusDialogOpen(false);
    },
    onError: (error) => {
      console.error("Error updating complaint:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update complaint status. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleStatusChange = async (status: string, afterPhoto: string | null) => {
    console.log(`handleStatusChange called with status ${status} and afterPhoto: ${afterPhoto ? 'provided' : 'not provided'}`);
    
    if (status === "Resolved" && !afterPhoto) {
      toast({
        title: "Photo Required",
        description: "Please upload an 'after work' photo to mark as resolved.",
        variant: "destructive"
      });
      return;
    }

    if (!selectedComplaint?.id) {
      toast({
        title: "Error",
        description: "Selected complaint not found.",
        variant: "destructive"
      });
      return;
    }

    try {
      let afterImageUrl = undefined;
      
      if (afterPhoto && status === "Resolved") {
        try {
          console.log("Uploading after photo...");
          afterImageUrl = await uploadImage(afterPhoto, 'resolved');
          console.log("Successfully uploaded after photo:", afterImageUrl);
        } catch (uploadError) {
          console.error("Failed to upload after photo:", uploadError);
          toast({
            title: "Upload Failed",
            description: "Failed to upload the after photo. Please try again.",
            variant: "destructive"
          });
          return;
        }
      }
      
      console.log("Calling mutation to update complaint status...");
      await updateComplaintMutation.mutateAsync({ 
        id: selectedComplaint.id, 
        status,
        afterImageUrl 
      });
    } catch (error) {
      console.error("Error in status update process:", error);
      toast({
        title: "Update Failed",
        description: "An error occurred while updating the status.",
        variant: "destructive"
      });
    }
  };

  return {
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
  };
};
