
import { Card } from "@/components/ui/card";

interface ComplaintListStateProps {
  isLoading: boolean;
  isEmpty: boolean;
  areaCode?: string;
}

const ComplaintListState = ({ isLoading, isEmpty, areaCode }: ComplaintListStateProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (isEmpty) {
    return (
      <Card className="p-8 text-center">
        <h3 className="text-xl font-medium mb-2">No Complaints Found</h3>
        <p className="text-gray-500">
          {areaCode 
            ? `There are no complaints in your area (${areaCode}) matching your criteria.`
            : "No complaints match your search criteria."}
        </p>
      </Card>
    );
  }
  
  return null;
};

export default ComplaintListState;
