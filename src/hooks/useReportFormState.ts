
import { useState } from "react";
import { readImageFile, validateImageFile } from "@/utils/imageUtils";
import { toast } from "@/hooks/use-toast";
import { ReportFormData } from "@/utils/formValidation";

export const useReportFormState = () => {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [pincode, setPincode] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (validateImageFile(file)) {
        try {
          const imageData = await readImageFile(file);
          setImage(imageData);
        } catch (error) {
          toast({
            title: "Read Error",
            description: "Failed to read the image file. Please try again.",
            variant: "destructive",
          });
        }
      }
    }
  };

  const resetForm = () => {
    setTitle("");
    setLocation("");
    setPincode("");
    setDescription("");
    setImage(null);
    setLoading(false);
  };

  const getFormData = (): ReportFormData => ({
    title,
    location,
    pincode,
    description,
    image
  });

  return {
    // Form state
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
    setLoading,
    
    // Methods
    handleImageUpload,
    resetForm,
    getFormData
  };
};
