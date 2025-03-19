
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ComplaintDetailsDialogProps {
  complaint: any;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const ComplaintDetailsDialog = ({ complaint, isOpen, setIsOpen }: ComplaintDetailsDialogProps) => {
  if (!complaint) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-4xl bg-white">
        <DialogHeader>
          <DialogTitle>{complaint.title}</DialogTitle>
          <DialogDescription>
            Complaint ID: {complaint.id}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <div>
            <h4 className="font-medium mb-2">Before Photo</h4>
            {complaint.image_url ? (
              <div className="rounded-lg overflow-hidden h-64 bg-gray-100">
                <img 
                  src={complaint.image_url} 
                  alt="Before cleanup" 
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
                <p className="text-gray-500">No image available</p>
              </div>
            )}
          </div>
          
          <div>
            <h4 className="font-medium mb-2">After Photo</h4>
            {complaint.after_image_url ? (
              <div className="rounded-lg overflow-hidden h-64 bg-gray-100">
                <img 
                  src={complaint.after_image_url} 
                  alt="After cleanup" 
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
                <p className="text-gray-500">Not resolved yet</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <p><strong>Location:</strong> {complaint.location}</p>
          <p><strong>Area Code:</strong> {complaint.pincode}</p>
          <p><strong>Description:</strong> {complaint.description}</p>
          <p><strong>Reported on:</strong> {complaint.created_at ? new Date(complaint.created_at).toLocaleDateString() : 'N/A'}</p>
          <p><strong>Status:</strong> {complaint.status}</p>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ComplaintDetailsDialog;
