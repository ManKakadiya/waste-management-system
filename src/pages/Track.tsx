import { useState } from "react";
import { Search, Filter, MapPin, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card } from "@/components/ui/card";

const Track = () => {
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState("");

  const complaints = [
    {
      id: "WMS-2024-001",
      title: "Overflowing Garbage Bin",
      location: "123 Main Street",
      description: "Garbage bin near the park entrance is overflowing and needs immediate attention.",
      date: "2024-02-20",
      status: "Resolved",
    },
    {
      id: "WMS-2024-002",
      title: "Illegal Dumping",
      location: "456 Oak Avenue",
      description: "Found construction waste illegally dumped on the side of the road.",
      date: "2024-02-19",
      status: "Pending",
    },
    {
      id: "WMS-2024-003",
      title: "Broken Recycling Bin",
      location: "789 Pine Road",
      description: "Community recycling bin is damaged and needs replacement.",
      date: "2024-02-18",
      status: "In Progress",
    },
    {
      id: "WMS-2024-004",
      title: "Garden Waste Not Cleared",
      location: "Library Backyard",
      description: "Garden waste not cleared in the library area.",
      date: "2024-02-12",
      status: "Under Review",
    },
    {
      id: "WMS-2024-005",
      title: "E-waste Collection Needed",
      location: "Computer Lab",
      description: "E-waste collection is needed in the computer lab.",
      date: "2024-02-13",
      status: "Pending",
    },
    {
      id: "WMS-2024-006",
      title: "Plastic Bottles After Event",
      location: "Sports Ground",
      description: "Plastic bottles found after a sports event.",
      date: "2024-02-13",
      status: "In Progress",
    },
    {
      id: "WMS-2024-007",
      title: "Hazardous Waste Disposal Required",
      location: "Chemistry Lab",
      description: "Hazardous waste disposal is required in the chemistry lab.",
      date: "2024-02-14",
      status: "Under Review",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "resolved":
        return "text-green-600 bg-green-50";
      case "in progress":
        return "text-orange-600 bg-orange-50";
      case "pending":
        return "text-red-600 bg-red-50";
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

  const filteredComplaints = complaints.filter((complaint) =>
    complaint.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    complaint.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    complaint.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    complaint.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface to-surface-secondary p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
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
          <Button variant="outline" className="w-full sm:w-auto">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>

        <div className="grid gap-4">
          {filteredComplaints.map((complaint) => (
            <Card
              key={complaint.id}
              className="p-4 hover:shadow-lg transition-shadow"
            >
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
                Reported on: {new Date(complaint.date).toLocaleDateString()}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Track;
