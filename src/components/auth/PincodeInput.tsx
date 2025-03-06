
import { Input } from "@/components/ui/input";

interface PincodeInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
}

export function PincodeInput({ value, onChange, disabled }: PincodeInputProps) {
  return (
    <div className="space-y-2">
      <label htmlFor="areaCode" className="text-sm font-medium">
        Pincode
      </label>
      <Input
        id="areaCode"
        name="areaCode"
        type="text"
        required
        placeholder="Enter 6-digit pincode"
        value={value}
        onChange={onChange}
        pattern="[0-9]{6}"
        maxLength={6}
        disabled={disabled}
      />
      <p className="text-xs text-muted-foreground">
        Enter the pincode of the area your organization is responsible for.
      </p>
    </div>
  );
}
