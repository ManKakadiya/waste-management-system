
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface TrackHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const TrackHeader = ({ searchQuery, setSearchQuery }: TrackHeaderProps) => {
  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Track Your Reports</h1>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            className="w-full pl-10 pr-4 py-2"
            placeholder="Search reports..."
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
    </>
  );
};

export default TrackHeader;
