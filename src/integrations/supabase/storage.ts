
import { supabase } from "./client";
import { v4 as uuidv4 } from 'uuid';

const BUCKET_NAME = 'waste-reports';

// Upload image to Supabase Storage and return public URL
export const uploadImage = async (
  base64Image: string, 
  folder = 'complaints'
): Promise<string> => {
  try {
    console.log(`Starting image upload to ${folder} folder...`);
    
    // Remove the data URL prefix if it exists
    const base64Data = base64Image.includes('base64,') 
      ? base64Image.split('base64,')[1] 
      : base64Image;
    
    // Generate a unique filename
    const filename = `${folder}/${uuidv4()}.jpg`;
    
    console.log(`Generated filename: ${filename} for upload`);
    
    // Convert base64 to Blob
    const blob = await fetch(`data:image/jpeg;base64,${base64Data}`).then(res => res.blob());
    
    console.log(`Converting base64 to blob successful, size: ${blob.size} bytes`);
    
    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filename, blob, {
        contentType: 'image/jpeg',
        upsert: true
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

// Helper function to check if the bucket exists - now just for diagnostics
export const checkBucketExists = async (): Promise<boolean> => {
  try {
    // Check if the bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error("Error checking buckets:", bucketsError);
      return false;
    }
    
    const bucketExists = buckets.some(bucket => bucket.name === BUCKET_NAME);
    console.log(`Bucket ${BUCKET_NAME} exists: ${bucketExists}`);
    return bucketExists;
  } catch (error) {
    console.error("Error checking if bucket exists:", error);
    return false;
  }
};

// For backwards compatibility
export const uploadImageToStorage = uploadImage;
export const uploadImageToCloudinary = uploadImage;

// Export bucket name for consistency across the app
export const STORAGE_BUCKET_NAME = BUCKET_NAME;
