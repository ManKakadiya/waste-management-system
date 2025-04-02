
import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/municipal/DashboardLayout";
import AreaCodeMissing from "@/components/municipal/AreaCodeMissing";
import DashboardError from "@/components/municipal/DashboardError";

interface DashboardAccessControlProps {
  children: ReactNode;
  isLoading: boolean;
  profileError: Error | unknown | null;
  areaCode?: string;
  user: any;
  isMunicipalOrNGO: boolean;
  title: string;
  subtitle?: React.ReactNode;
}

const DashboardAccessControl = ({ 
  children, 
  isLoading, 
  profileError, 
  areaCode, 
  user, 
  isMunicipalOrNGO,
  title,
  subtitle
}: DashboardAccessControlProps) => {
  // If profile is still loading, render nothing yet
  if (isLoading) {
    return (
      <DashboardLayout title={title} subtitle={subtitle}>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  // If no area code is available, show an error message
  if (!areaCode && user && isMunicipalOrNGO) {
    console.log("No area code found for user:", user.id);
    return (
      <DashboardLayout title={title}>
        <AreaCodeMissing />
      </DashboardLayout>
    );
  }

  // Handle profile errors
  if (profileError) {
    console.error("Error fetching profile:", profileError);
    return (
      <DashboardLayout title={title}>
        <DashboardError error={profileError} />
      </DashboardLayout>
    );
  }

  // If all checks pass, render children
  return (
    <DashboardLayout title={title} subtitle={subtitle}>
      {children}
    </DashboardLayout>
  );
};

export default DashboardAccessControl;
