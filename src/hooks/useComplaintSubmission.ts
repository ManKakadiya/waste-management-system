
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { uploadImageToCloudinary } from "@/integrations/supabase/storage";
import { ReportFormData, validateReportForm } from "@/utils/formValidation";

export const useComplaintSubmission = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const createComplaintMutation = useMutation({
    mutationFn: async ({ 
      title, 
      location, 
      pincode, 
      description, 
      imageUrl 
    }: { 
      title: string; 
      location: string; 
      pincode: string; 
      description: string; 
      imageUrl?: string;
    }) => {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      const { data, error } = await supabase
        .from('complaints')
        .insert({
          title,
          location,
          pincode,
          description,
          image_url: imageUrl,
          user_id: user.id,
          area_code: pincode // We're using pincode as area_code for matching
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Report Submitted",
        description: "Your waste report has been successfully submitted.",
        variant: "success",
      });
      
      // Redirect to track page
      navigate('/track');
    },
    onError: (error) => {
      console.error("Error submitting report:", error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your report. Please try again.",
        variant: "destructive",
      });
    }
  });

  const submitComplaint = async (formData: ReportFormData, setLoading: (loading: boolean) => void) => {
    if (!validateReportForm(formData)) {
      return;
    }
    
    setLoading(true);
    
    try {
      let imageUrl;
      
      if (formData.image) {
        try {
          // Upload to Cloudinary
          imageUrl = await uploadImageToCloudinary(formData.image, 'waste-reports');
          console.log("Cloudinary upload successful:", imageUrl);
        } catch (uploadError: any) {
          console.error("Image upload error:", uploadError);
          throw new Error(`Failed to upload image: ${uploadError.message || "Unknown error"}`);
        }
      }
      
      // Create the complaint record
      await createComplaintMutation.mutateAsync({
        title: formData.title,
        location: formData.location,
        pincode: formData.pincode,
        description: formData.description,
        imageUrl
      });
      
    } catch (error: any) {
      console.error("Error in submission process:", error);
      toast({
        title: "Upload Failed",
        description: error.message || "An error occurred while uploading your report.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return {
    user,
    submitComplaint,
    isPending: createComplaintMutation.isPending
  };
};
