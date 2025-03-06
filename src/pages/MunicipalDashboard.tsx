
import { useState, useEffect } from "react";
import { Search, MapPin, Clock, Upload, Check, AlertCircle, Building, Filter } from "lucide-react";
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
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const queryClient = useQueryClient();

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

  // Fetch profile to get area code
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('area_code, account_type, username')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch complaints based on area code
  const { data: complaints = [], isLoading } = useQuery({
    queryKey: ['complaints', profile?.area_code, statusFilter],
    queryFn: async () => {
      if (!profile?.area_code) return [];
      
      let query = supabase
        .from('complaints')
        .select('*')
        .eq('pincode', profile.area_code);
      
      if (statusFilter) {
        query = query.eq('status', statusFilter);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.area_code,
  });

  // Update complaint status mutation
  const updateComplaintMutation = useMutation({
    mutationFn: async ({ id, status, afterImageUrl }: { id: string, status: string, afterImageUrl?: string }) => {
      const updateData: any = { status };
      
      if (afterImageUrl) {
        updateData.after_image_url = afterImageUrl;
      }
      
      const { data, error } = await supabase
        .from('complaints')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      toast({
        title: "Status Updated",
        description: `Complaint has been marked as ${selectedStatus}.`,
      });
      setStatusDialogOpen(false);
      setSelectedStatus("");
      setAfterPhoto(null);
    },
    onError: (error) => {
      console.error("Error updating complaint:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update complaint status. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleStatusChange = async () => {
    if (selectedStatus === "Resolved" && !afterPhoto) {
      toast({
        title: "Photo Required",
        description: "Please upload an 'after work' photo to mark as resolved.",
        variant: "destructive"
      });
      return;
    }

    if (!selectedComplaint?.id) {
      toast({
        title: "Error",
        description: "Selected complaint not found.",
        variant: "destructive"
      });
      return;
    }

    try {
      let afterImageUrl = null;
      
      // Upload the after photo if it exists
      if (afterPhoto && selectedStatus === "Resolved") {
        const file = afterPhoto.split(",")[1]; // Remove the data URL prefix
        const fileName = `after_${selectedComplaint.id}_${Date.now()}.jpg`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('complaints')
          .upload(fileName, decode(file), {
            contentType: 'image/jpeg',
            upsert: true
          });
        
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('complaints')
          .getPublicUrl(fileName);
          
        afterImageUrl = publicUrl;
      }
      
      await updateComplaintMutation.mutateAsync({ 
        id: selectedComplaint.id, 
        status: selectedStatus,
        afterImageUrl 
      });
    } catch (error) {
      console.error("Error in status update process:", error);
      toast({
        title: "Update Failed",
        description: "An error occurred while updating the status.",
        variant: "destructive"
      });
    }
  };

  // Helper function to decode base64
  const decode = (dataString: string) => {
    return Buffer.from(dataString, 'base64');
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
      case "under review":
        return "text-blue-600 bg-blue-50";
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

  // Filter complaints based on search query
  const filteredComplaints = complaints.filter((complaint) => {
    const searchMatch = 
      complaint.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.pincode.toLowerCase().includes(searchQuery.toLowerCase());
    
    return searchMatch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface to-surface-secondary p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Municipal Waste Management Dashboard</h1>
            {profile?.area_code && (
              <div className="flex items-center mt-2 text-sm font-medium text-primary">
                <Building className="w-4 h-4 mr-1" />
                Managing Area: {profile.area_code} - {profile?.account_type === 'municipal' ? 'Municipal Corporation' : 'NGO'}
              </div>
            )}
          </div>
        </div>
        
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
            <Select value={statusFilter || ""} onValueChange={(value) => setStatusFilter(value || null)}>
              <SelectTrigger className="w-full sm:w-[180px] flex gap-2">
                <Filter className="w-4 h-4" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Under Review">Under Review</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : filteredComplaints.length === 0 ? (
          <Card className="p-8 text-center">
            <h3 className="text-xl font-medium mb-2">No Complaints Found</h3>
            <p className="text-gray-500">
              {profile?.area_code 
                ? `There are no complaints in your area (${profile.area_code}) matching your criteria.`
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
              {selectedComplaint?.image_url ? (
                <div className="rounded-lg overflow-hidden h-64 bg-gray-100">
                  <img 
                    src={selectedComplaint?.image_url} 
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
              {selectedComplaint?.after_image_url ? (
                <div className="rounded-lg overflow-hidden h-64 bg-gray-100">
                  <img 
                    src={selectedComplaint?.after_image_url} 
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
            <p><strong>Area Code:</strong> {selectedComplaint?.pincode}</p>
            <p><strong>Description:</strong> {selectedComplaint?.description}</p>
            <p><strong>Reported on:</strong> {selectedComplaint?.created_at ? new Date(selectedComplaint.created_at).toLocaleDateString() : 'N/A'}</p>
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
            <Button onClick={handleStatusChange} disabled={updateComplaintMutation.isPending}>
              {updateComplaintMutation.isPending ? 
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" /> : null}
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MunicipalDashboard;
