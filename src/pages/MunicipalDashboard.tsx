
import { useState, useEffect } from "react";
import { Search, MapPin, Clock, Upload, Check, AlertCircle, Building } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/lib/auth";
import { useNavigate } from "react-router-dom";

const MunicipalDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [afterPhoto, setAfterPhoto] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is authorized (municipal or NGO)
    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (user.role !== 'municipal' && user.role !== 'ngo') {
      navigate('/');
      toast({
        title: "Access restricted",
        description: "Only municipal or NGO accounts can access this dashboard.",
        variant: "destructive"
      });
    }
  }, [user, navigate, toast]);

  // This would be fetched from a database in a real implementation
  const complaints = [
    {
      id: "WMS-2024-001",
      title: "Overflowing Garbage Bin",
      location: "123 Main Street",
      description: "Garbage bin near the park entrance is overflowing and needs immediate attention.",
      date: "2024-02-20",
      status: "Resolved",
      image: "https://images.unsplash.com/photo-1605600659873-d808a13e4d2a",
      afterImage: "https://images.unsplash.com/photo-1558021212-51b6ecfa0db9",
      area: "North Zone"
    },
    {
      id: "WMS-2024-002",
      title: "Illegal Dumping",
      location: "456 Oak Avenue",
      description: "Found construction waste illegally dumped on the side of the road.",
      date: "2024-02-19",
      status: "Pending",
      image: "https://images.unsplash.com/photo-1505567745926-ba89000f8a3c",
      afterImage: null,
      area: "South Zone"
    },
    {
      id: "WMS-2024-003",
      title: "Broken Recycling Bin",
      location: "789 Pine Road",
      description: "Community recycling bin is damaged and needs replacement.",
      date: "2024-02-18",
      status: "In Progress",
      image: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b",
      afterImage: null,
      area: "East Zone"
    },
    {
      id: "WMS-2024-004",
      title: "Garden Waste Not Cleared",
      location: "Library Backyard",
      description: "Garden waste not cleared in the library area.",
      date: "2024-02-12",
      status: "Under Review",
      image: "https://images.unsplash.com/photo-1591193128914-5e555be66676",
      afterImage: null,
      area: "West Zone"
    },
    {
      id: "WMS-2024-005",
      title: "E-waste Collection Needed",
      location: "Computer Lab",
      description: "E-waste collection is needed in the computer lab.",
      date: "2024-02-13",
      status: "Pending",
      image: "https://images.unsplash.com/photo-1567567528709-f474a724aacf",
      afterImage: null,
      area: "Central Zone"
    },
  ];

  const handleStatusChange = async () => {
    if (selectedStatus === "Resolved" && !afterPhoto) {
      toast({
        title: "Photo Required",
        description: "Please upload an 'after work' photo to mark as resolved.",
        variant: "destructive"
      });
      return;
    }

    // Here you would update the complaint status in the database
    toast({
      title: "Status Updated",
      description: `Complaint ${selectedComplaint?.id} has been marked as ${selectedStatus}.`,
    });
    
    setStatusDialogOpen(false);
    setSelectedStatus("");
    setAfterPhoto(null);
  };

  const handleAfterPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAfterPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

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
        return <Check className="w-4 h-4" />;
      case "in progress":
        return "⟳";
      case "pending":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return "?";
    }
  };

  // Filter complaints based on search query AND user's area code
  const filteredComplaints = complaints.filter((complaint) => {
    // First check if complaint matches the user's area (for municipal/NGO users)
    const areaMatch = !user?.areaCode || complaint.area === user.areaCode;
    
    // Then check if it matches the search query
    const searchMatch = 
      complaint.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.area.toLowerCase().includes(searchQuery.toLowerCase());
    
    return areaMatch && searchMatch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface to-surface-secondary p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Municipal Waste Management Dashboard</h1>
            {user?.areaCode && (
              <div className="flex items-center mt-2 text-sm font-medium text-primary">
                <Building className="w-4 h-4 mr-1" />
                Managing Area: {user.areaCode}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 items-center mb-6">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              className="w-full pl-10 pr-4 py-2"
              placeholder="Search complaints by ID, title, location, or area..."
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {filteredComplaints.length === 0 ? (
          <Card className="p-8 text-center">
            <h3 className="text-xl font-medium mb-2">No Complaints Found</h3>
            <p className="text-gray-500">
              {user?.areaCode 
                ? `There are no complaints in your area (${user.areaCode}) matching your search criteria.`
                : "No complaints match your search criteria."}
            </p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredComplaints.map((complaint) => (
              <Card
                key={complaint.id}
                className="p-4 hover:shadow-lg transition-shadow"
              >
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
                      {complaint.location} - <span className="font-medium ml-1">{complaint.area}</span>
                    </div>
                    <p className="text-gray-600 mb-3">{complaint.description}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      Reported on: {new Date(complaint.date).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="flex flex-row md:flex-col gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSelectedComplaint(complaint);
                        setDialogOpen(true);
                      }}
                    >
                      View Details
                    </Button>
                    <Button 
                      variant="default"
                      onClick={() => {
                        setSelectedComplaint(complaint);
                        setStatusDialogOpen(true);
                      }}
                    >
                      Update Status
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* View Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedComplaint?.title}</DialogTitle>
            <DialogDescription>
              Complaint ID: {selectedComplaint?.id}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div>
              <h4 className="font-medium mb-2">Before Photo</h4>
              {selectedComplaint?.image ? (
                <div className="rounded-lg overflow-hidden h-64 bg-gray-100">
                  <img 
                    src={selectedComplaint?.image} 
                    alt="Before cleanup" 
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
                  <p className="text-gray-500">No image available</p>
                </div>
              )}
            </div>
            
            <div>
              <h4 className="font-medium mb-2">After Photo</h4>
              {selectedComplaint?.afterImage ? (
                <div className="rounded-lg overflow-hidden h-64 bg-gray-100">
                  <img 
                    src={selectedComplaint?.afterImage} 
                    alt="After cleanup" 
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
                  <p className="text-gray-500">Not resolved yet</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <p><strong>Location:</strong> {selectedComplaint?.location}</p>
            <p><strong>Area:</strong> {selectedComplaint?.area}</p>
            <p><strong>Description:</strong> {selectedComplaint?.description}</p>
            <p><strong>Reported on:</strong> {selectedComplaint?.date}</p>
            <p><strong>Status:</strong> {selectedComplaint?.status}</p>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Complaint Status</DialogTitle>
            <DialogDescription>
              Change the status of complaint {selectedComplaint?.id}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select New Status:</label>
              <Select onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Under Review">Under Review</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {selectedStatus === "Resolved" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Upload 'After Work' Photo:</label>
                <div className="relative">
                  <input
                    id="afterPhoto"
                    type="file"
                    accept="image/*"
                    onChange={handleAfterPhotoUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="afterPhoto"
                    className="flex items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary transition-colors duration-300"
                  >
                    {afterPhoto ? (
                      <img
                        src={afterPhoto}
                        alt="Preview"
                        className="h-full w-full object-cover rounded-xl"
                      />
                    ) : (
                      <div className="text-center">
                        <Upload className="mx-auto w-8 h-8 text-text-secondary mb-2" />
                        <span className="text-sm text-text-secondary">
                          Upload 'after work' photo (required)
                        </span>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleStatusChange}>
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MunicipalDashboard;
