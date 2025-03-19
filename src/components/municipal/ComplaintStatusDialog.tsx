
import { useState } from "react";
import { Upload } from "lucide-react";
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
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [afterPhoto, setAfterPhoto] = useState<string | null>(null);
  
  const handleAfterPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAfterPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = () => {
    if (!selectedStatus) {
      return;
    }
    onStatusChange(selectedStatus, afterPhoto);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) {
        setSelectedStatus("");
        setAfterPhoto(null);
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
                  className="flex items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary transition-colors duration-300 bg-white"
                >
                  {afterPhoto ? (
                    <img
                      src={afterPhoto}
                      alt="Preview"
                      className="h-full w-full object-cover rounded-xl"
                    />
                  ) : (
                    <div className="text-center">
                      <Upload className="mx-auto w-8 h-8 text-text-secondary mb-2" />
                      <span className="text-sm text-text-secondary">
                        Upload 'after work' photo (required)
                      </span>
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
            disabled={isPending || !selectedStatus}
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
