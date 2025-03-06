
import { Input } from "@/components/ui/input";

interface EmailPasswordInputsProps {
  email: string;
  password: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
}

export function EmailPasswordInputs({ email, password, onChange, disabled }: EmailPasswordInputsProps) {
  return (
    <>
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          placeholder="name@example.com"
          value={email}
          onChange={onChange}
          disabled={disabled}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          placeholder="••••••••"
          value={password}
          onChange={onChange}
          minLength={6}
          disabled={disabled}
        />
      </div>
    </>
  );
}
