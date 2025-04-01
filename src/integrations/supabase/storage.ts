import { supabase } from "./client";

// Initialize Cloudinary configuration
const CLOUDINARY_CLOUD_NAME = "demo"; // Replace with your Cloudinary cloud name
const CLOUDINARY_UPLOAD_PRESET = "ml_default"; // Replace with your unsigned upload preset

// Helper function to check if a bucket exists (keeping for backward compatibility)
export const checkBucketExists = async (bucketName: string) => {
  try {
    const { data, error } = await supabase.storage.getBucket(bucketName);
    return !error && data;
  } catch (error) {
    console.error(`Error checking if bucket ${bucketName} exists:`, error);
    return false;
  }
};

// Helper function to create a bucket if it doesn't exist (keeping for backward compatibility)
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

// New function to upload image to Cloudinary
export const uploadImageToCloudinary = async (base64Image: string, folder = 'complaints') => {
  try {
    // Remove the data URL prefix if it exists
    const base64Data = base64Image.includes('base64,') 
      ? base64Image.split('base64,')[1] 
      : base64Image;
    
    // Prepare the upload data
    const formData = new FormData();
    formData.append('file', `data:image/jpeg;base64,${base64Data}`);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', folder);
    
    // Upload to Cloudinary
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Cloudinary upload failed: ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const result = await response.json();
    console.log('Upload successful:', result);
    return result.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

// Call this function when the app starts, with retry mechanism
const initBuckets = () => {
  // Keep this for backward compatibility
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
