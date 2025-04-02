
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface EmptyStateProps {
  isSignedIn: boolean;
  hasSearchQuery: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

const EmptyState = ({ isSignedIn, hasSearchQuery, onRefresh, isRefreshing }: EmptyStateProps) => {
  if (!isSignedIn) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-8 text-center my-6">
        <h3 className="text-xl font-semibold mb-4">Sign In to Track Your Reports</h3>
        <p className="text-gray-600 mb-6">
          You need to be signed in to track your waste management reports.
        </p>
        <Button asChild>
          <Link to="/auth">Sign In</Link>
        </Button>
      </div>
    );
  }

  if (hasSearchQuery) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-8 text-center my-6">
        <h3 className="text-xl font-semibold mb-4">No Matching Reports</h3>
        <p className="text-gray-600 mb-6">
          No reports match your search criteria. Try adjusting your search query.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="outline" onClick={() => window.location.reload()}>
            Clear Search
          </Button>
          {onRefresh && (
            <Button 
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh Status'}
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-8 text-center my-6">
      <h3 className="text-xl font-semibold mb-4">No Reports Found</h3>
      <p className="text-gray-600 mb-6">
        You haven't submitted any waste management reports yet.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild>
          <Link to="/report">Report New Issue</Link>
        </Button>
        {onRefresh && (
          <Button 
            variant="outline"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh Status'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
