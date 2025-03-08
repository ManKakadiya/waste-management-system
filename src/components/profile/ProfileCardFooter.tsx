
import { CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type ProfileCardFooterProps = {
  isEditing: boolean;
  isOrganization: boolean;
  onEdit: () => void;
};

export const ProfileCardFooter = ({ isEditing, isOrganization, onEdit }: ProfileCardFooterProps) => {
  if (isEditing || !isOrganization) return null;
  
  return (
    <CardFooter className="flex justify-end border-t p-4">
      <Button 
        onClick={onEdit}
        variant="outline"
      >
        Edit Profile
      </Button>
    </CardFooter>
  );
};
