
import { useState } from "react";
import { Search, MapPin, Clock, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const Track = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Fetch user's complaints
  const { data: complaints = [], isLoading } = useQuery({
    queryKey: ['user-complaints', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

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

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : user && filteredComplaints.length === 0 ? (
          <Card className="p-8 text-center">
            <h3 className="text-xl font-medium mb-2">No Reports Found</h3>
            {searchQuery ? (
              <p className="text-gray-500">No reports match your search criteria.</p>
            ) : (
              <p className="text-gray-500">You haven't submitted any reports yet.</p>
            )}
            <Button className="mt-4" onClick={() => window.location.href = "/report"}>
              Submit a Report
            </Button>
          </Card>
        ) : !user ? (
          <Card className="p-8 text-center">
            <h3 className="text-xl font-medium mb-2">Sign In Required</h3>
            <p className="text-gray-500">Please sign in to view your reports.</p>
            <Button className="mt-4" onClick={() => window.location.href = "/auth"}>
              Sign In
            </Button>
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
                      {complaint.location}
                    </div>
                    <p className="text-gray-600 mb-3">{complaint.description}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      Reported on: {new Date(complaint.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div>
                    <Button 
                      variant="outline" 
                      className="flex items-center gap-2"
                      onClick={() => {
                        setSelectedComplaint(complaint);
                        setDialogOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                      View Details
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Complaint Details Dialog */}
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
              <h4 className="font-medium mb-2">Reported Photo</h4>
              {selectedComplaint?.image_url ? (
                <div className="rounded-lg overflow-hidden h-64 bg-gray-100">
                  <img 
                    src={selectedComplaint?.image_url} 
                    alt="Reported issue" 
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
              <h4 className="font-medium mb-2">After Resolution Photo</h4>
              {selectedComplaint?.after_image_url ? (
                <div className="rounded-lg overflow-hidden h-64 bg-gray-100">
                  <img 
                    src={selectedComplaint?.after_image_url} 
                    alt="After resolution" 
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
                  <p className="text-gray-500">
                    {selectedComplaint?.status === "Resolved" 
                      ? "Resolution photo pending" 
                      : "Not resolved yet"}
                  </p>
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
    </div>
  );
};

export default Track;
