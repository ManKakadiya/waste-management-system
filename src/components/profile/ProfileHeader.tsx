
import { UserCircle, Building } from 'lucide-react';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

type ProfileHeaderProps = {
  username: string;
  accountType: string;
};

export const ProfileHeader = ({ username, accountType }: ProfileHeaderProps) => {
  const isOrganization = accountType === 'municipal' || accountType === 'ngo';
  
  return (
    <CardHeader className="bg-muted/30">
      <CardTitle className="flex items-center gap-2">
        {isOrganization ? (
          <Building className="h-5 w-5 text-primary" />
        ) : (
          <UserCircle className="h-5 w-5 text-primary" />
        )}
        {username}
      </CardTitle>
      <CardDescription>
        Account type: {accountType === 'municipal' 
          ? 'Municipal Corporation' 
          : accountType === 'ngo' 
            ? 'NGO / Waste Management Organization' 
            : 'Individual User'}
      </CardDescription>
    </CardHeader>
  );
};
