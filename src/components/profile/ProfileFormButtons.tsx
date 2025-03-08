
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

type ProfileFormButtonsProps = {
  isEditing: boolean;
  isLoading: boolean;
  onCancel: () => void;
};

export const ProfileFormButtons = ({ isEditing, isLoading, onCancel }: ProfileFormButtonsProps) => {
  if (!isEditing) return null;
  
  return (
    <div className="flex justify-end space-x-2 pt-4">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isLoading}
      >
        Cancel
      </Button>
      <Button 
        type="submit"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          'Save Changes'
        )}
      </Button>
    </div>
  );
};
