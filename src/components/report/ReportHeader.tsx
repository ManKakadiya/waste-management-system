
import React from 'react';
import { useAuth } from '@/lib/auth';

const ReportHeader = () => {
  const { user } = useAuth();
  const isMunicipalOrNGO = user?.role === 'municipal' || user?.role === 'ngo';

  if (isMunicipalOrNGO) {
    return (
      <div className="text-center fade-in">
        <h1 className="text-3xl md:text-4xl font-bold text-text mb-4">
          Waste Management Dashboard
        </h1>
        <p className="text-text-secondary">
          Manage and respond to waste-related reports in your area.
        </p>
      </div>
    );
  }

  return (
    <div className="text-center fade-in">
      <h1 className="text-3xl md:text-4xl font-bold text-text mb-4">
        Report Waste Issue
      </h1>
      <p className="text-text-secondary">
        Help keep our community clean by reporting waste-related issues.
      </p>
    </div>
  );
};

export default ReportHeader;
