
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthForm } from '@/hooks/useAuthForm';
import { UsernameInput } from '@/components/auth/UsernameInput';
import { UserTypeSelection } from '@/components/auth/UserTypeSelection';
import { PincodeInput } from '@/components/auth/PincodeInput';
import { EmailPasswordInputs } from '@/components/auth/EmailPasswordInputs';
import { SubmitButton } from '@/components/auth/SubmitButton';

export default function Auth() {
  const {
    formData,
    isLoading,
    isSignUp,
    usernameError,
    checkingUsername,
    handleInputChange,
    handleRoleChange,
    handleSubmit,
    toggleAuthMode
  } = useAuthForm();

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface to-surface-secondary flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">
            {isSignUp ? 'Create an Account' : 'Welcome Back'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isSignUp
              ? 'Sign up to start managing waste reports'
              : 'Sign in to your account'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <>
              <UsernameInput
                value={formData.username}
                onChange={handleInputChange}
                error={usernameError}
                disabled={isLoading}
                isChecking={checkingUsername}
              />
              
              <UserTypeSelection
                role={formData.role}
                onChange={handleRoleChange}
                disabled={isLoading}
              />
              
              {(formData.role === 'municipal' || formData.role === 'ngo') && (
                <PincodeInput
                  value={formData.areaCode}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              )}
            </>
          )}
          
          <EmailPasswordInputs
            email={formData.email}
            password={formData.password}
            onChange={handleInputChange}
            disabled={isLoading}
          />

          <SubmitButton
            isLoading={isLoading}
            isCheckingUsername={checkingUsername}
            isSignUp={isSignUp}
          />
        </form>

        <div className="text-center">
          <Button
            variant="link"
            className="text-sm"
            onClick={toggleAuthMode}
            disabled={isLoading || checkingUsername}
          >
            {isSignUp
              ? 'Already have an account? Sign In'
              : "Don't have an account? Sign Up"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
