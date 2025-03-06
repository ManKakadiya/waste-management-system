
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface SubmitButtonProps {
  isLoading: boolean;
  isCheckingUsername: boolean;
  isSignUp: boolean;
}

export function SubmitButton({ isLoading, isCheckingUsername, isSignUp }: SubmitButtonProps) {
  return (
    <Button
      type="submit"
      className="w-full"
      disabled={isLoading || isCheckingUsername}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {isSignUp ? 'Creating account...' : 'Signing in...'}
        </>
      ) : isCheckingUsername ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Checking username...
        </>
      ) : (
        <>{isSignUp ? 'Sign Up' : 'Sign In'}</>
      )}
    </Button>
  );
}
