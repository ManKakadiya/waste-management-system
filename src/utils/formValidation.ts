
import { toast } from "@/hooks/use-toast";

export interface ReportFormData {
  title: string;
  location: string;
  pincode: string;
  description: string;
  image: string | null;
}

/**
 * Validates the report form data
 * @param formData The report form data to validate
 * @returns True if valid, false otherwise
 */
export const validateReportForm = (formData: ReportFormData): boolean => {
  const { title, location, pincode, description, image } = formData;
  
  if (!title.trim()) {
    toast({
      title: "Title Required",
      description: "Please enter a title for your report.",
      variant: "destructive",
    });
    return false;
  }
  
  if (!location.trim()) {
    toast({
      title: "Location Required",
      description: "Please specify the location of the waste issue.",
      variant: "destructive",
    });
    return false;
  }
  
  if (!pincode.trim()) {
    toast({
      title: "Pincode Required",
      description: "Please provide the pincode for better tracking.",
      variant: "destructive",
    });
    return false;
  }
  
  if (!/^\d{6}$/.test(pincode)) {
    toast({
      title: "Invalid Pincode",
      description: "Please enter a valid 6-digit pincode.",
      variant: "destructive",
    });
    return false;
  }
  
  if (!description.trim()) {
    toast({
      title: "Description Required",
      description: "Please provide a description of the waste issue.",
      variant: "destructive",
    });
    return false;
  }
  
  if (!image) {
    toast({
      title: "Image Required",
      description: "Please upload an image of the waste issue.",
      variant: "destructive",
    });
    return false;
  }
  
  return true;
};
