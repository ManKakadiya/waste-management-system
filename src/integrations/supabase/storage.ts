
import { supabase } from "./client";
import { toast } from "@/hooks/use-toast";

const BUCKET_NAME = 'waste-reports';

// Helper function to check if a bucket exists
export const checkBucketExists = async (bucketName: string) => {
  try {
    const { data, error } = await supabase.storage.getBucket(bucketName);
    return !error && data;
  } catch (error) {
    console.error(`Error checking if bucket ${bucketName} exists:`, error);
    return false;
  }
};

// Upload image to Supabase Storage
export const uploadImageToStorage = async (
  base64Image: string, 
  folder = 'complaints'
): Promise<string> => {
  try {
    // Remove the data URL prefix if it exists
    const base64Data = base64Image.includes('base64,') 
      ? base64Image.split('base64,')[1] 
      : base64Image;
    
    // Generate a unique filename
    const filename = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 15)}.jpg`;
    
    // Convert base64 to Blob
    const blob = await fetch(`data:image/jpeg;base64,${base64Data}`).then(res => res.blob());
    
    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filename, blob, {
        contentType: 'image/jpeg',
        upsert: false
      });
    
    if (error) {
      console.error('Supabase storage upload error:', error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }
    
    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filename);
    
    console.log('Upload successful, public URL:', publicUrlData.publicUrl);
    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Error uploading to Supabase storage:', error);
    throw error;
  }
};

// Initialize complaints bucket
export const initComplaintsBucket = async () => {
  return checkBucketExists(BUCKET_NAME);
};

// Call this function when the app starts, with retry mechanism
const initBuckets = () => {
  let retries = 0;
  const maxRetries = 3;
  
  const attemptInit = async () => {
    try {
      const exists = await initComplaintsBucket();
      if (exists) {
        console.log('Complaints bucket exists and is ready');
      } else if (retries < maxRetries) {
        retries++;
        console.log(`Bucket not found (${retries}/${maxRetries}), retrying...`);
        setTimeout(attemptInit, 2000 * retries);
      } else {
        console.error('Failed to initialize storage bucket after multiple attempts');
      }
    } catch (err) {
      console.error('Failed to initialize storage bucket:', err);
      if (retries < maxRetries) {
        retries++;
        console.log(`Retrying bucket check (${retries}/${maxRetries})...`);
        setTimeout(attemptInit, 2000 * retries);
      }
    }
  };
  
  attemptInit();
};

// Start the initialization process
initBuckets();

// Export uploadImageToStorage as the main upload function
export { uploadImageToStorage as uploadImageToCloudinary };

