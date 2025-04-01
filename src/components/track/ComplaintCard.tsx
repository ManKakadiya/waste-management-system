
import { MapPin, Clock, Eye, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getStatusColor, getStatusIcon } from "@/utils/complaintUtils";

interface ComplaintCardProps {
  complaint: any;
  onViewDetails: (complaint: any) => void;
  onDeleteClick: (complaintId: string) => void;
}

const ComplaintCard = ({ complaint, onViewDetails, onDeleteClick }: ComplaintCardProps) => {
  return (
    <Card className="p-4 hover:shadow-lg transition-shadow bg-white">
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold">{complaint.title}</h3>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium inline-flex items-center gap-1 ${getStatusColor(
                complaint.status
              )}`}
            >
              {getStatusIcon(complaint.status)} {complaint.status}
            </span>
          </div>
          <div className="flex items-center text-sm text-gray-500 mb-2">
            <MapPin className="h-4 w-4 mr-1" />
            {complaint.location}
          </div>
          <p className="text-gray-600 mb-3">{complaint.description}</p>
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="h-4 w-4 mr-1" />
            Reported on: {new Date(complaint.created_at).toLocaleDateString()}
          </div>
        </div>
        
        <div className="flex flex-col gap-2">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => onViewDetails(complaint)}
          >
            <Eye className="h-4 w-4" />
            View Details
          </Button>
          
          <Button 
            variant="destructive" 
            className="flex items-center gap-2"
            onClick={() => onDeleteClick(complaint.id)}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ComplaintCard;
