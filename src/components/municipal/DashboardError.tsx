
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface DashboardErrorProps {
  error: Error | unknown;
}

const DashboardError = ({ error }: DashboardErrorProps) => {
  console.error("Dashboard error details:", error);
  
  return (
    <Card className="p-8 text-center">
      <h3 className="text-xl font-bold mb-2">Error Loading Complaints</h3>
      <p className="text-gray-500">
        There was a problem loading complaints. Please try again later or contact support.
      </p>
      <Button 
        className="bg-primary text-white px-4 py-2 rounded mt-4"
        onClick={() => window.location.reload()}
      >
        Try Again
      </Button>
    </Card>
  );
};

export default DashboardError;
