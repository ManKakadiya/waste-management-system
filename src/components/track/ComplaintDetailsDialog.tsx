
import { useState } from "react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { getStatusColor, getStatusIcon } from "@/utils/complaintUtils";

interface ComplaintDetailsDialogProps {
  complaint: any;
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}

const ComplaintDetailsDialog = ({ 
  complaint, 
  isOpen, 
  onClose,
  onRefresh 
}: ComplaintDetailsDialogProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (!onRefresh) return;
    
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!complaint) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl">{complaint.title}</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Status:
            </span>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium inline-flex items-center gap-1 ${getStatusColor(
                complaint.status
              )}`}
            >
              {getStatusIcon(complaint.status)} {complaint.status}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Location:
            </span>
            <span className="text-sm font-medium">{complaint.location}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Pincode:
            </span>
            <span className="text-sm font-medium">{complaint.pincode}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Date Reported:
            </span>
            <span className="text-sm font-medium">
              {new Date(complaint.created_at).toLocaleString()}
            </span>
          </div>
          
          <div className="mt-2">
            <h4 className="text-sm font-medium mb-1">Description:</h4>
            <p className="text-sm text-gray-700 border rounded-md p-3 bg-gray-50">{complaint.description}</p>
          </div>
          
          {complaint.image_url && (
            <div className="mt-2">
              <h4 className="text-sm font-medium mb-1">Image:</h4>
              <div className="border rounded-md overflow-hidden">
                <img 
                  src={complaint.image_url} 
                  alt="Complaint" 
                  className="w-full object-cover max-h-60" 
                />
              </div>
            </div>
          )}
          
          {complaint.after_image_url && complaint.status === "Resolved" && (
            <div className="mt-2">
              <h4 className="text-sm font-medium mb-1">After Resolution:</h4>
              <div className="border rounded-md overflow-hidden">
                <img 
                  src={complaint.after_image_url} 
                  alt="After resolution" 
                  className="w-full object-cover max-h-60" 
                />
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex gap-2">
          {onRefresh && (
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh Status'}
            </Button>
          )}
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ComplaintDetailsDialog;
