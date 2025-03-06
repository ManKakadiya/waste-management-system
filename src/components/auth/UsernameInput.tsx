
import { Input } from "@/components/ui/input";

interface UsernameInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error: string;
  disabled: boolean;
  isChecking: boolean;
}

export function UsernameInput({ value, onChange, error, disabled, isChecking }: UsernameInputProps) {
  return (
    <div className="space-y-2">
      <label htmlFor="username" className="text-sm font-medium">
        Username
      </label>
      <Input
        id="username"
        name="username"
        type="text"
        required
        placeholder="johndoe"
        value={value}
        onChange={onChange}
        minLength={3}
        className={error ? "border-red-500" : ""}
        disabled={disabled || isChecking}
      />
      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
      {!error && (
        <p className="text-xs text-muted-foreground mt-1">Only letters, numbers, and underscores allowed.</p>
      )}
    </div>
  );
}
