
import { useNavigate } from "react-router-dom";
import { useReportForm } from "@/hooks/useReportForm";
import ReportHeader from "@/components/report/ReportHeader";
import ReportForm from "@/components/report/ReportForm";

const Report = () => {
  const navigate = useNavigate();
  const {
    user,
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

  // If user is municipal or NGO, redirect to dashboard
  if (user?.role === 'municipal' || user?.role === 'ngo') {
    navigate('/municipal-dashboard');
    return null;
  }

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
