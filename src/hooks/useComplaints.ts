
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { decode } from "@/utils/complaintUtils";

export const useComplaints = (areaCode: string | undefined, statusFilter: string | null) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);

  // Fetch complaints based on area code
  const { data: complaints = [], isLoading, error: complaintsError } = useQuery({
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
        return data || [];
      } catch (error) {
        console.error("Exception in complaint fetch:", error);
        throw error;
      }
    },
    enabled: !!areaCode,
    retry: 2,
  });

  // Update complaint status mutation
  const updateComplaintMutation = useMutation({
    mutationFn: async ({ id, status, afterImageUrl }: { id: string, status: string, afterImageUrl?: string }) => {
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
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      toast({
        title: "Status Updated",
        description: `Complaint status has been updated successfully.`,
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
      
      // Upload the after photo if it exists
      if (afterPhoto && status === "Resolved") {
        const file = afterPhoto.split(",")[1]; // Remove the data URL prefix
        const fileName = `after_${selectedComplaint.id}_${Date.now()}.jpg`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('complaints')
          .upload(fileName, decode(file), {
            contentType: 'image/jpeg',
            upsert: true
          });
        
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('complaints')
          .getPublicUrl(fileName);
          
        afterImageUrl = publicUrl;
      }
      
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
    updateComplaintMutation
  };
};
