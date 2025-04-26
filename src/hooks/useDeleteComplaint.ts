
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { getStoragePathFromUrl } from "@/utils/storageUtils";

export const useDeleteComplaint = (onDeleteSuccess: (complaintId: string) => void) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (complaintId: string) => {
      if (!user?.id) throw new Error("User not authenticated");
      
      console.log("Starting deletion process for complaint:", complaintId);
      
      try {
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
        
        if (complaint.image_url) {
          const imagePath = getStoragePathFromUrl(complaint.image_url);
          if (imagePath) {
            console.log("Deleting image from storage:", imagePath);
            const { error: deleteImageError } = await supabase.storage
              .from('waste-reports')
              .remove([imagePath]);
              
            if (deleteImageError) {
              console.error("Error deleting image:", deleteImageError);
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
            }
          }
        }
        
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
      
      queryClient.invalidateQueries({
        queryKey: ['user-complaints', user?.id]
      });
      
      onDeleteSuccess(complaintId);
      
      toast({
        title: "Complaint Deleted",
        description: "Your complaint has been successfully deleted.",
        variant: "success",
      });
    },
    onError: (error) => {
      console.error("Error deleting complaint:", error);
      
      toast({
        title: "Deletion Failed",
        description: "There was an error deleting your complaint. Please try again.",
        variant: "destructive",
      });
    }
  });
};
