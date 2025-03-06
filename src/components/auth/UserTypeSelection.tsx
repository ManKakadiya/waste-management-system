
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface UserTypeSelectionProps {
  role: string;
  onChange: (value: string) => void;
  disabled: boolean;
}

export function UserTypeSelection({ role, onChange, disabled }: UserTypeSelectionProps) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">Account Type</label>
      <RadioGroup 
        value={role} 
        onValueChange={onChange}
        className="flex flex-col space-y-1"
        disabled={disabled}
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="user" id="user" />
          <Label htmlFor="user">Individual User</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="municipal" id="municipal" />
          <Label htmlFor="municipal">Municipal Corporation</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="ngo" id="ngo" />
          <Label htmlFor="ngo">NGO / Waste Management Organization</Label>
        </div>
      </RadioGroup>
    </div>
  );
}
