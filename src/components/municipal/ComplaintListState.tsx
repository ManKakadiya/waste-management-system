
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2 } from "lucide-react";

interface ComplaintListStateProps {
  isLoading: boolean;
  isEmpty: boolean;
  areaCode?: string;
}

const ComplaintListState = ({ isLoading, isEmpty, areaCode }: ComplaintListStateProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
          <p className="mt-4 text-gray-500">Loading complaints...</p>
        </div>
      </div>
    );
  }
  
  if (isEmpty) {
    return (
      <Card className="p-8 text-center">
        <div className="flex flex-col items-center">
          <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
          <h3 className="text-xl font-medium mb-2">No Complaints Found</h3>
          {areaCode ? (
            <p className="text-gray-500 max-w-md mx-auto">
              There are currently no waste management complaints reported in your area ({areaCode}).
              This could mean either your area is well-maintained or residents haven't reported issues yet.
            </p>
          ) : (
            <p className="text-gray-500">
              No complaints match your search criteria. Try adjusting your filters.
            </p>
          )}
        </div>
      </Card>
    );
  }
  
  return null;
};

export default ComplaintListState;
