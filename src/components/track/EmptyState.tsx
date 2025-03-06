
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  isSignedIn: boolean;
  hasSearchQuery: boolean;
}

const EmptyState = ({ isSignedIn, hasSearchQuery }: EmptyStateProps) => {
  if (!isSignedIn) {
    return (
      <Card className="p-8 text-center">
        <h3 className="text-xl font-medium mb-2">Sign In Required</h3>
        <p className="text-gray-500">Please sign in to view your reports.</p>
        <Button className="mt-4" onClick={() => window.location.href = "/auth"}>
          Sign In
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-8 text-center">
      <h3 className="text-xl font-medium mb-2">No Reports Found</h3>
      {hasSearchQuery ? (
        <p className="text-gray-500">No reports match your search criteria.</p>
      ) : (
        <p className="text-gray-500">You haven't submitted any reports yet.</p>
      )}
      <Button className="mt-4" onClick={() => window.location.href = "/report"}>
        Submit a Report
      </Button>
    </Card>
  );
};

export default EmptyState;
