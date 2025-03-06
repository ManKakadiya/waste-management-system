
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

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
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
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
    
    setLoading(true);
    
    try {
      let imageUrl;
      
      if (image) {
        // Remove the data URL prefix and get the base64 data
        const file = image.split(",")[1];
        const fileName = `report_${Date.now()}.jpg`;
        
        // Upload the image to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('complaints')
          .upload(fileName, Buffer.from(file, 'base64'), {
            contentType: 'image/jpeg',
            upsert: true
          });
          
        if (uploadError) throw uploadError;
        
        // Get the public URL of the uploaded image
        const { data: { publicUrl } } = supabase.storage
          .from('complaints')
          .getPublicUrl(fileName);
          
        imageUrl = publicUrl;
      }
      
      // Create the complaint record
      await createComplaintMutation.mutateAsync({
        title,
        location,
        pincode,
        description,
        imageUrl
      });
      
    } catch (error) {
      console.error("Error in submission process:", error);
      toast({
        title: "Upload Failed",
        description: "An error occurred while uploading your report.",
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
