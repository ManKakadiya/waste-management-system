
import { useState, useEffect } from "react";
import { Upload, Camera } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { validateImageFile, readImageFile } from "@/utils/imageUtils";
import { useToast } from "@/hooks/use-toast";
import { checkBucketExists } from "@/integrations/supabase/storage";

interface ComplaintStatusDialogProps {
  complaint: any;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onStatusChange: (status: string, afterPhoto: string | null) => void;
  isPending: boolean;
}

const ComplaintStatusDialog = ({ 
  complaint, 
  isOpen, 
  setIsOpen, 
  onStatusChange,
  isPending
}: ComplaintStatusDialogProps) => {
  const { toast } = useToast();
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [afterPhoto, setAfterPhoto] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [bucketReady, setBucketReady] = useState(false);
  const [isCapturingPhoto, setIsCapturingPhoto] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [initializing, setInitializing] = useState(true);
  
  // Initialize storage check when dialog opens
  useEffect(() => {
    if (isOpen) {
      const checkStorage = async () => {
        try {
          setInitializing(true);
          const exists = await checkBucketExists();
          setBucketReady(exists);
          
          if (!exists) {
            toast({
              title: "Storage Setup Issue",
              description: "Storage bucket not found. Contact administrator.",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error("Error checking bucket:", error);
          setBucketReady(false);
          toast({
            title: "Storage Connection Error",
            description: "Could not connect to storage service. Try again later.",
            variant: "destructive",
          });
        } finally {
          setInitializing(false);
        }
      };
      
      checkStorage();
    } else {
      // Clean up camera if dialog is closed
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        setCameraStream(null);
      }
      setIsCapturingPhoto(false);
    }
  }, [isOpen, toast, cameraStream]);
  
  const handleAfterPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateImageFile(file)) {
      try {
        console.log("Reading image file...");
        const dataUrl = await readImageFile(file);
        console.log("Image file read successfully, setting after photo");
        setAfterPhoto(dataUrl);
      } catch (error) {
        console.error("Error reading image file:", error);
        toast({
          title: "Upload Error",
          description: "Could not read the selected image file.",
          variant: "destructive",
        });
      }
    }
  };
  
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateImageFile(file)) {
        try {
          const dataUrl = await readImageFile(file);
          setAfterPhoto(dataUrl);
        } catch (error) {
          console.error("Error reading dropped image file:", error);
          toast({
            title: "Upload Error",
            description: "Could not read the dropped image file.",
            variant: "destructive",
          });
        }
      }
    }
  };
  
  // Start camera capture
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      setCameraStream(mediaStream);
      setIsCapturingPhoto(true);
      
      // Connect the stream to video element
      const videoElement = document.getElementById('camera-preview') as HTMLVideoElement;
      if (videoElement) {
        videoElement.srcObject = mediaStream;
        videoElement.play();
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast({
        title: "Camera Error",
        description: "Could not access your device camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };
  
  // Take photo from camera
  const takePhoto = () => {
    try {
      const videoElement = document.getElementById('camera-preview') as HTMLVideoElement;
      const canvas = document.createElement('canvas');
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setAfterPhoto(dataUrl);
        
        // Stop camera after taking photo
        if (cameraStream) {
          cameraStream.getTracks().forEach(track => track.stop());
          setCameraStream(null);
        }
        setIsCapturingPhoto(false);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      toast({
        title: "Camera Error",
        description: "Failed to capture photo. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Cancel camera capture
  const cancelCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsCapturingPhoto(false);
  };
  
  const handleSubmit = () => {
    if (!selectedStatus) {
      toast({
        title: "Status Required",
        description: "Please select a status.",
        variant: "destructive",
      });
      return;
    }
    
    if (selectedStatus === "Resolved" && !afterPhoto) {
      toast({
        title: "Photo Required",
        description: "Please upload an 'after work' photo to mark as resolved.",
        variant: "destructive",
      });
      return;
    }
    
    // We proceed even if bucket isn't ready - warn the user
    if (selectedStatus === "Resolved" && !bucketReady) {
      toast({
        title: "Storage Warning",
        description: "Storage system might not be ready. Upload may fail.",
        variant: "warning",
      });
    }
    
    onStatusChange(selectedStatus, afterPhoto);
  };
  
  // Reset form when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedStatus("");
      setAfterPhoto(null);
      setDragActive(false);
    } else if (complaint) {
      // Pre-select the current status when dialog opens
      setSelectedStatus(complaint.status || "");
    }
  }, [isOpen, complaint]);
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) {
        setSelectedStatus("");
        setAfterPhoto(null);
        setDragActive(false);
        // Clean up camera if open
        if (cameraStream) {
          cameraStream.getTracks().forEach(track => track.stop());
          setCameraStream(null);
        }
        setIsCapturingPhoto(false);
      }
    }}>
      <DialogContent className="bg-white max-w-md">
        <DialogHeader>
          <DialogTitle>Update Complaint Status</DialogTitle>
          <DialogDescription>
            Change the status of complaint {complaint?.id}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {initializing ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Checking storage system...</span>
            </div>
          ) : !bucketReady ? (
            <div className="p-3 rounded-md bg-amber-50 border border-amber-200 text-amber-700 text-sm">
              <p className="font-semibold mb-1">Storage Not Ready</p>
              <p>The storage system isn't properly configured.</p>
              <p className="mt-1 text-xs">You can update status, but photo uploads may fail.</p>
            </div>
          ) : null}

          <div className="space-y-2">
            <label className="text-sm font-medium">Select New Status:</label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="Pending" className="hover:bg-green-50 focus:bg-green-50">Pending</SelectItem>
                <SelectItem value="In Progress" className="hover:bg-green-50 focus:bg-green-50">In Progress</SelectItem>
                <SelectItem value="Under Review" className="hover:bg-green-50 focus:bg-green-50">Under Review</SelectItem>
                <SelectItem value="Resolved" className="hover:bg-green-50 focus:bg-green-50">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {selectedStatus === "Resolved" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Upload 'After Work' Photo:</label>
              
              {isCapturingPhoto ? (
                <div className="space-y-3">
                  <div className="relative overflow-hidden rounded-lg border border-border bg-black aspect-video">
                    <video 
                      id="camera-preview" 
                      className="w-full h-full object-cover"
                      playsInline
                      autoPlay
                    />
                  </div>
                  <div className="flex justify-center gap-2">
                    <Button 
                      type="button" 
                      onClick={takePhoto}
                      className="bg-primary hover:bg-primary/90 text-white"
                    >
                      Take Photo
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={cancelCamera}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : afterPhoto ? (
                <div className="space-y-3">
                  <div className="relative overflow-hidden rounded-lg border border-border">
                    <img
                      src={afterPhoto}
                      alt="Preview"
                      className="w-full h-48 object-cover"
                    />
                  </div>
                  <div className="flex justify-center">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setAfterPhoto(null)}
                    >
                      Remove Photo
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <input
                      id="afterPhoto"
                      type="file"
                      accept="image/*"
                      onChange={handleAfterPhotoUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="afterPhoto"
                      className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed 
                      ${dragActive ? "border-primary" : "border-border"} 
                      rounded-lg cursor-pointer hover:border-primary transition-colors duration-300 bg-white`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <div className="text-center">
                        <Upload className="mx-auto w-8 h-8 text-primary mb-1" />
                        <span className="text-xs text-text-secondary block">
                          Upload Photo
                        </span>
                      </div>
                    </label>
                  </div>
                  
                  <Button 
                    type="button" 
                    onClick={startCamera}
                    className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-border
                    rounded-lg hover:border-primary transition-colors duration-300 bg-white text-primary"
                  >
                    <Camera className="w-8 h-8 mb-1" />
                    <span className="text-xs">Take Photo</span>
                  </Button>
                </div>
              )}
              
              <p className="text-xs text-gray-500 text-center mt-2">
                {bucketReady ? 
                  "Required to mark as resolved" : 
                  "Initializing storage..."}
              </p>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={
              isPending || 
              !selectedStatus || 
              (selectedStatus === "Resolved" && !afterPhoto) ||
              initializing
            }
            className="bg-primary hover:bg-primary-hover text-white">
            {isPending ? 
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" /> : null}
            Update Status
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ComplaintStatusDialog;
