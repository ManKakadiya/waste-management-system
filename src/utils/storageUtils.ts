
export const getStoragePathFromUrl = (url: string): string | null => {
  if (!url) return null;
  
  try {
    const urlObj = new URL(url);
    const segments = urlObj.pathname.split('/');
    const bucketIndex = segments.findIndex(segment => segment === 'waste-reports');
    
    if (bucketIndex !== -1 && bucketIndex < segments.length - 1) {
      return segments.slice(bucketIndex + 1).join('/');
    }
    
    return null;
  } catch (error) {
    console.error("Failed to parse storage URL:", error);
    return null;
  }
};
