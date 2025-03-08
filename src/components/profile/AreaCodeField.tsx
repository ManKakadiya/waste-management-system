
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin } from 'lucide-react';

type AreaCodeFieldProps = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isEditing: boolean;
  isLoading: boolean;
};

export const AreaCodeField = ({ value, onChange, isEditing, isLoading }: AreaCodeFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="areaCode" className="flex items-center gap-1">
        <MapPin className="h-4 w-4" />
        Area Code
      </Label>
      <div className="relative">
        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          id="areaCode"
          name="areaCode"
          value={value}
          onChange={onChange}
          readOnly={!isEditing}
          disabled={!isEditing || isLoading}
          className={!isEditing ? "bg-muted pl-10" : "pl-10"}
          placeholder="Enter 6-digit area code"
          maxLength={6}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        The area code determines which complaints you can manage
      </p>
    </div>
  );
};
