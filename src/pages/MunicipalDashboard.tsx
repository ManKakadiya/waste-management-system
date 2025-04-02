
import { Building } from "lucide-react";
import { useMunicipalDashboard } from "@/hooks/useMunicipalDashboard";
import DashboardAccessControl from "@/components/municipal/DashboardAccessControl";
import DashboardContent from "@/components/municipal/DashboardContent";

const MunicipalDashboard = () => {
  const {
    user,
    profileLoading,
    profileError,
    profile,
    areaCode,
    role,
    roleTitle,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    filteredComplaints,
    complaintsData,
    isMunicipalOrNGO
  } = useMunicipalDashboard();

  // Generate the subtitle with area code info
  const dashboardSubtitle = areaCode && (
    <div className="flex items-center mt-2 text-sm font-medium text-primary">
      <Building className="w-4 h-4 mr-1" />
      Managing Area: {areaCode} - {role === 'municipal' ? 'Municipal Corporation' : 'NGO'}
    </div>
  );

  return (
    <DashboardAccessControl
      isLoading={profileLoading}
      profileError={profileError}
      areaCode={areaCode}
      user={user}
      isMunicipalOrNGO={isMunicipalOrNGO}
      title={roleTitle}
      subtitle={dashboardSubtitle}
    >
      <DashboardContent
        isLoading={complaintsData.isLoading}
        profileLoading={profileLoading}
        filteredComplaints={filteredComplaints}
        areaCode={areaCode}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        complaintsData={complaintsData}
      />
    </DashboardAccessControl>
  );
};

export default MunicipalDashboard;
