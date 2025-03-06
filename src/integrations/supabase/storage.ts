
import { supabase } from "./client";

// Helper function to check if a bucket exists
export const checkBucketExists = async (bucketName: string) => {
  const { data, error } = await supabase.storage.getBucket(bucketName);
  return !error && data;
};

// Helper function to create a bucket if it doesn't exist
export const createBucketIfNotExists = async (bucketName: string, isPublic: boolean = true) => {
  const exists = await checkBucketExists(bucketName);
  
  if (!exists) {
    const { error } = await supabase.storage.createBucket(bucketName, {
      public: isPublic
    });
    
    if (error) {
      console.error(`Error creating bucket ${bucketName}:`, error);
      return false;
    }
    
    return true;
  }
  
  return true;
};

// Initialize complaints bucket
export const initComplaintsBucket = async () => {
  return createBucketIfNotExists('complaints', true);
};

// Call this function when the app starts
initComplaintsBucket()
  .then(created => {
    if (created) {
      console.log('Complaints bucket created or already exists');
    }
  })
  .catch(err => {
    console.error('Failed to initialize complaints bucket:', err);
  });
