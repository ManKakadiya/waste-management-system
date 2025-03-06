
import { MapPin, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ComplaintCardProps {
  complaint: any;
  onViewDetails: () => void;
  onUpdateStatus: () => void;
}

const ComplaintCard = ({ complaint, onViewDetails, onUpdateStatus }: ComplaintCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "resolved":
        return "text-green-600 bg-green-50";
      case "in progress":
        return "text-orange-600 bg-orange-50";
      case "pending":
        return "text-red-600 bg-red-50";
      case "under review":
        return "text-blue-600 bg-blue-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "resolved":
        return "✓";
      case "in progress":
        return "⟳";
      case "pending":
        return "!";
      default:
        return "?";
    }
  };

  return (
    <Card className="p-4 hover:shadow-lg transition-shadow">
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
            {complaint.location} - <span className="font-medium ml-1">{complaint.pincode}</span>
          </div>
          <p className="text-gray-600 mb-3">{complaint.description}</p>
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="h-4 w-4 mr-1" />
            Reported on: {new Date(complaint.created_at).toLocaleDateString()}
          </div>
        </div>
        
        <div className="flex flex-row md:flex-col gap-2">
          <Button 
            variant="outline" 
            onClick={onViewDetails}
          >
            View Details
          </Button>
          <Button 
            variant="default"
            onClick={onUpdateStatus}
          >
            Update Status
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ComplaintCard;
