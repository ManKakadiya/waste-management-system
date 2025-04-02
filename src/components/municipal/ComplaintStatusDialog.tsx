
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
import { createBucketIfNotExists } from "@/integrations/supabase/storage";

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
  
  // Initialize storage bucket when dialog opens
  useEffect(() => {
    if (isOpen) {
      const initBucket = async () => {
        try {
          const exists = await createBucketIfNotExists('waste-reports');
          setBucketReady(exists);
          if (!exists) {
            toast({
              title: "Storage Error",
              description: "Could not initialize storage bucket for image uploads.",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error("Error initializing bucket:", error);
          setBucketReady(false);
          toast({
            title: "Storage Error",
            description: "Failed to connect to storage service. Image uploads may not work.",
            variant: "destructive",
          });
        }
      };
      
      initBucket();
    }
  }, [isOpen, toast]);
  
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
    
    // Check if storage is ready for uploads
    if (selectedStatus === "Resolved" && !bucketReady) {
      toast({
        title: "Storage Not Ready",
        description: "The storage system is not ready. Please try again later.",
        variant: "destructive",
      });
      return;
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
      }
    }}>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>Update Complaint Status</DialogTitle>
          <DialogDescription>
            Change the status of complaint {complaint?.id}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
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
                  className={`flex items-center justify-center w-full h-32 border-2 border-dashed 
                  ${dragActive ? "border-primary" : "border-border"} 
                  rounded-xl cursor-pointer hover:border-primary transition-colors duration-300 bg-white`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {afterPhoto ? (
                    <img
                      src={afterPhoto}
                      alt="Preview"
                      className="h-full w-full object-cover rounded-xl"
                    />
                  ) : (
                    <div className="text-center">
                      <div className="flex flex-col items-center">
                        <Upload className="mx-auto w-8 h-8 text-primary mb-2" />
                        <span className="text-sm text-text-secondary">
                          Upload 'after work' photo (required)
                        </span>
                        <span className="text-xs text-gray-400 mt-1">
                          {bucketReady ? 
                            "Stored in Supabase Storage" : 
                            "Initializing storage..."}
                        </span>
                      </div>
                    </div>
                  )}
                </label>
              </div>
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
              (selectedStatus === "Resolved" && !bucketReady)
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
