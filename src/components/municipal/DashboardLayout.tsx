
import { ReactNode } from "react";

interface DashboardLayoutProps {
  children: ReactNode;
  title: string | React.ReactNode;
  subtitle?: string;
}

const DashboardLayout = ({ children, title, subtitle }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-surface to-surface-secondary p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            {typeof title === 'string' ? (
              <h1 className="text-3xl font-bold">{title}</h1>
            ) : (
              title
            )}
            {subtitle && <div className="mt-2 text-sm font-medium text-primary">{subtitle}</div>}
          </div>
        </div>
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;
