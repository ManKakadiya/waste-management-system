
import { supabase } from "./client";
import { useToast } from "@/hooks/use-toast";

const BUCKET_NAME = 'waste-reports';

// Helper function to check if a bucket exists
export const checkBucketExists = async (bucketName: string) => {
  try {
    const { data, error } = await supabase.storage.getBucket(bucketName);
    if (error) {
      console.error(`Error checking bucket ${bucketName}:`, error);
      return false;
    }
    return !!data;
  } catch (error) {
    console.error(`Error checking if bucket ${bucketName} exists:`, error);
    return false;
  }
};

// Helper function to create a bucket if it doesn't exist
export const createBucketIfNotExists = async (bucketName: string) => {
  try {
    const exists = await checkBucketExists(bucketName);
    
    if (!exists) {
      console.log(`Bucket ${bucketName} does not exist, attempting to create it...`);
      const { data, error } = await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 10 * 1024 * 1024 // 10MB limit
      });
      
      if (error) {
        console.error(`Failed to create bucket ${bucketName}:`, error);
        return false;
      }
      
      console.log(`Successfully created bucket ${bucketName}`);
      
      // Set up public access policy for the bucket
      try {
        await setupPublicAccessPolicy(bucketName);
        console.log(`Successfully set up public access policy for bucket ${bucketName}`);
      } catch (policyError) {
        console.error(`Error setting up public access policy for bucket ${bucketName}:`, policyError);
      }
      
      return true;
    }
    
    return true;
  } catch (error) {
    console.error(`Error creating bucket ${bucketName}:`, error);
    return false;
  }
};

// Setup public access policy for the bucket
const setupPublicAccessPolicy = async (bucketName: string) => {
  try {
    // Make sure bucket is set to public
    const { error: updateError } = await supabase
      .storage
      .updateBucket(bucketName, {
        public: true,
        fileSizeLimit: 10 * 1024 * 1024
      });
    
    if (updateError) {
      console.error(`Error updating bucket ${bucketName} to public:`, updateError);
      throw updateError;
    }
    
    return true;
  } catch (error) {
    console.error(`Error setting up public access policy:`, error);
    throw error;
  }
};

// Upload image to Supabase Storage
export const uploadImageToStorage = async (
  base64Image: string, 
  folder = 'complaints'
): Promise<string> => {
  try {
    console.log(`Starting image upload to ${folder} folder...`);
    
    // Ensure the bucket exists before uploading
    const bucketExists = await createBucketIfNotExists(BUCKET_NAME);
    if (!bucketExists) {
      throw new Error(`Storage bucket ${BUCKET_NAME} doesn't exist and couldn't be created`);
    }
    
    // Remove the data URL prefix if it exists
    const base64Data = base64Image.includes('base64,') 
      ? base64Image.split('base64,')[1] 
      : base64Image;
    
    // Generate a unique filename
    const filename = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 15)}.jpg`;
    
    console.log(`Generated filename: ${filename} for upload`);
    
    // Convert base64 to Blob
    const blob = await fetch(`data:image/jpeg;base64,${base64Data}`).then(res => res.blob());
    
    console.log(`Converting base64 to blob successful, size: ${blob.size} bytes`);
    
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
    
    console.log('Upload successful, data:', data);
    
    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filename);
    
    console.log('Public URL generated:', publicUrlData.publicUrl);
    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Error uploading to Supabase storage:', error);
    throw error;
  }
};

// Initialize complaints bucket
export const initComplaintsBucket = async () => {
  try {
    console.log('Initializing complaints bucket...');
    const exists = await createBucketIfNotExists(BUCKET_NAME);
    return exists;
  } catch (error) {
    console.error('Error initializing complaints bucket:', error);
    return false;
  }
};

// Call this function when the app starts, with retry mechanism
export const initBuckets = async () => {
  let retries = 0;
  const maxRetries = 5;
  
  const attemptInit = async () => {
    try {
      const exists = await initComplaintsBucket();
      if (exists) {
        console.log('Complaints bucket exists and is ready');
        return true;
      } else if (retries < maxRetries) {
        retries++;
        console.log(`Bucket initialization failed (${retries}/${maxRetries}), retrying...`);
        await new Promise(resolve => setTimeout(resolve, 2000 * retries));
        return attemptInit();
      } else {
        console.error('Failed to initialize storage bucket after multiple attempts');
        return false;
      }
    } catch (err) {
      console.error('Failed to initialize storage bucket:', err);
      if (retries < maxRetries) {
        retries++;
        console.log(`Retrying bucket initialization (${retries}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, 2000 * retries));
        return attemptInit();
      } else {
        console.error('Maximum retries exceeded for bucket initialization');
        return false;
      }
    }
  };
  
  return attemptInit();
};

// Initialize buckets on module load
initBuckets().then(success => {
  if (success) {
    console.log('Storage buckets successfully initialized');
  } else {
    console.error('Failed to initialize storage buckets after all retries');
  }
});

// Export the same function name for backward compatibility
export { uploadImageToStorage as uploadImageToCloudinary };
