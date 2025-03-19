
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ComplaintFilterProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string | null;
  setStatusFilter: (status: string | null) => void;
}

const ComplaintFilter = ({ 
  searchQuery, 
  setSearchQuery, 
  statusFilter, 
  setStatusFilter 
}: ComplaintFilterProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center mb-6">
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          className="w-full pl-10 pr-4 py-2"
          placeholder="Search complaints by title, location, or description..."
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="w-full sm:w-auto">
        <Select 
          value={statusFilter || "all"} 
          onValueChange={(value) => setStatusFilter(value === "all" ? null : value)}
        >
          <SelectTrigger className="w-full sm:w-[180px] flex gap-2 bg-white">
            <Filter className="w-4 h-4" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="all" className="text-primary hover:bg-green-50 focus:bg-green-50">All Statuses</SelectItem>
            <SelectItem value="Pending" className="hover:bg-green-50 focus:bg-green-50">Pending</SelectItem>
            <SelectItem value="Under Review" className="hover:bg-green-50 focus:bg-green-50">Under Review</SelectItem>
            <SelectItem value="In Progress" className="hover:bg-green-50 focus:bg-green-50">In Progress</SelectItem>
            <SelectItem value="Resolved" className="hover:bg-green-50 focus:bg-green-50">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ComplaintFilter;
