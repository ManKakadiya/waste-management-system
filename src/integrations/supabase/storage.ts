
import { supabase } from "./client";

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

// Helper function to create a bucket if it doesn't exist
export const createBucketIfNotExists = async (bucketName: string, isPublic: boolean = true) => {
  try {
    const exists = await checkBucketExists(bucketName);
    
    if (!exists) {
      console.log(`Bucket ${bucketName} does not exist, creating...`);
      const { error } = await supabase.storage.createBucket(bucketName, {
        public: isPublic
      });
      
      if (error) {
        console.error(`Error creating bucket ${bucketName}:`, error);
        return false;
      }
      
      console.log(`Bucket ${bucketName} created successfully`);
      return true;
    }
    
    console.log(`Bucket ${bucketName} already exists`);
    return true;
  } catch (err) {
    console.error(`Failed to create bucket ${bucketName}:`, err);
    return false;
  }
};

// Initialize complaints bucket
export const initComplaintsBucket = async () => {
  return createBucketIfNotExists('complaints', true);
};

// Call this function when the app starts, with retry mechanism
const initBuckets = () => {
  let retries = 0;
  const maxRetries = 3;
  
  const attemptInit = async () => {
    try {
      const created = await initComplaintsBucket();
      if (created) {
        console.log('Complaints bucket created or already exists');
      } else if (retries < maxRetries) {
        retries++;
        console.log(`Retrying bucket creation (${retries}/${maxRetries})...`);
        setTimeout(attemptInit, 2000 * retries);
      } else {
        console.error('Failed to initialize complaints bucket after multiple attempts');
      }
    } catch (err) {
      console.error('Failed to initialize complaints bucket:', err);
      if (retries < maxRetries) {
        retries++;
        console.log(`Retrying bucket creation (${retries}/${maxRetries})...`);
        setTimeout(attemptInit, 2000 * retries);
      }
    }
  };
  
  attemptInit();
};

// Start the initialization process
initBuckets();
