
import { toast } from "@/hooks/use-toast";

/**
 * Validates an image file for type and size constraints
 * @param file The file to validate
 * @returns True if valid, false otherwise
 */
export const validateImageFile = (file: File): boolean => {
  // Validate file type
  if (!file.type.startsWith('image/')) {
    toast({
      title: "Invalid File Type",
      description: "Please upload an image file (JPEG, PNG, etc.).",
      variant: "destructive",
    });
    return false;
  }
  
  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    toast({
      title: "File Too Large",
      description: "Please upload an image smaller than 5MB.",
      variant: "destructive",
    });
    return false;
  }
  
  return true;
};

/**
 * Reads an image file and returns its data URL
 * @param file The image file to read
 * @returns Promise that resolves to the data URL of the image
 */
export const readImageFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    
    reader.onerror = () => {
      reject(new Error("Failed to read the image file"));
    };
    
    reader.readAsDataURL(file);
  });
};
