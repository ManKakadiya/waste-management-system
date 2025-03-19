
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useReportForm } from "@/hooks/useReportForm";
import ReportHeader from "@/components/report/ReportHeader";
import ReportForm from "@/components/report/ReportForm";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

const Report = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  // Redirect municipal/NGO users to dashboard
  useEffect(() => {
    if (user?.role === 'municipal' || user?.role === 'ngo') {
      toast({
        title: "Access restricted",
        description: "Municipal/NGO accounts should use the dashboard instead.",
        variant: "destructive",
      });
      navigate('/municipal-dashboard');
    }
  }, [user, navigate, toast]);
  
  const {
    title,
    setTitle,
    location,
    setLocation,
    pincode,
    setPincode,
    description,
    setDescription,
    image,
    loading,
    handleImageUpload,
    handleSubmit,
    isPending
  } = useReportForm();

  return (
    <div className="min-h-screen bg-surface p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <ReportHeader />
        
        <ReportForm
          title={title}
          setTitle={setTitle}
          location={location}
          setLocation={setLocation}
          pincode={pincode}
          setPincode={setPincode}
          description={description}
          setDescription={setDescription}
          image={image}
          handleImageUpload={handleImageUpload}
          handleSubmit={handleSubmit}
          isLoading={loading}
          isPending={isPending}
        />
      </div>
    </div>
  );
};

export default Report;
