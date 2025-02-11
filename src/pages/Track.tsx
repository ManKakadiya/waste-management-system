
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileSearch } from "lucide-react";

const Track = () => {
  const complaints = [
    {
      id: "WMS-2024-001",
      location: "College Main Gate",
      description: "Accumulated garbage near entrance",
      date: "2024-02-10",
      status: "Resolved",
    },
    {
      id: "WMS-2024-002",
      location: "Canteen Area",
      description: "Overflow of waste bins",
      date: "2024-02-11",
      status: "In Progress",
    },
    {
      id: "WMS-2024-003",
      location: "Parking Lot B",
      description: "Plastic waste scattered",
      date: "2024-02-11",
      status: "Pending",
    },
    {
      id: "WMS-2024-004",
      location: "Library Backyard",
      description: "Garden waste not cleared",
      date: "2024-02-12",
      status: "Under Review",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "resolved":
        return "bg-green-100 text-green-800";
      case "in progress":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "under review":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface to-surface-secondary p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="text-center space-y-6 fade-in">
          <div className="inline-block p-3 bg-primary/10 rounded-xl mb-4">
            <FileSearch className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-primary tracking-tight">
            Track Complaints
          </h1>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Monitor the status of reported waste management issues
          </p>
        </header>

        <div className="glass-card rounded-2xl p-6 fade-in-up">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Complaint ID</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {complaints.map((complaint) => (
                <TableRow key={complaint.id}>
                  <TableCell className="font-medium">{complaint.id}</TableCell>
                  <TableCell>{complaint.location}</TableCell>
                  <TableCell>{complaint.description}</TableCell>
                  <TableCell>{new Date(complaint.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        complaint.status
                      )}`}
                    >
                      {complaint.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default Track;
