
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ReactNode } from 'react';

type ReadOnlyFieldProps = {
  id: string;
  label: string;
  value: string;
  icon: ReactNode;
  helperText?: string;
};

export const ReadOnlyField = ({ id, label, value, icon, helperText }: ReadOnlyFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="flex items-center gap-1">
        {icon}
        {label}
      </Label>
      <Input
        id={id}
        name={id}
        value={value}
        readOnly
        disabled
        className="bg-muted"
      />
      {helperText && (
        <p className="text-xs text-muted-foreground">
          {helperText}
        </p>
      )}
    </div>
  );
};
