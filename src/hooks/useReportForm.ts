
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { uploadImageToCloudinary } from "@/integrations/supabase/storage";

export const useReportForm = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [pincode, setPincode] = useState("");
  const [description, setDescription] = useState("");

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
      
      // Reset form
      setTitle("");
      setLocation("");
      setPincode("");
      setDescription("");
      setImage(null);
      setLoading(false);
      
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
      setLoading(false);
    }
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File Type",
          description: "Please upload an image file (JPEG, PNG, etc.).",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please upload an image smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.onerror = () => {
        toast({
          title: "Read Error",
          description: "Failed to read the image file. Please try again.",
          variant: "destructive",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a title for your report.",
        variant: "destructive",
      });
      return;
    }
    
    if (!location.trim()) {
      toast({
        title: "Location Required",
        description: "Please specify the location of the waste issue.",
        variant: "destructive",
      });
      return;
    }
    
    if (!pincode.trim()) {
      toast({
        title: "Pincode Required",
        description: "Please provide the pincode for better tracking.",
        variant: "destructive",
      });
      return;
    }
    
    if (!/^\d{6}$/.test(pincode)) {
      toast({
        title: "Invalid Pincode",
        description: "Please enter a valid 6-digit pincode.",
        variant: "destructive",
      });
      return;
    }
    
    if (!description.trim()) {
      toast({
        title: "Description Required",
        description: "Please provide a description of the waste issue.",
        variant: "destructive",
      });
      return;
    }
    
    if (!image) {
      toast({
        title: "Image Required",
        description: "Please upload an image of the waste issue.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      let imageUrl;
      
      if (image) {
        try {
          // Upload to Cloudinary instead of Supabase
          imageUrl = await uploadImageToCloudinary(image, 'waste-reports');
          console.log("Cloudinary upload successful:", imageUrl);
        } catch (uploadError: any) {
          console.error("Image upload error:", uploadError);
          throw new Error(`Failed to upload image: ${uploadError.message || "Unknown error"}`);
        }
      }
      
      // Create the complaint record
      await createComplaintMutation.mutateAsync({
        title,
        location,
        pincode,
        description,
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
    title,
    setTitle,
    location,
    setLocation,
    pincode,
    setPincode,
    description,
    setDescription,
    image,
    loading,
    handleImageUpload,
    handleSubmit,
    isPending: createComplaintMutation.isPending
  };
};
