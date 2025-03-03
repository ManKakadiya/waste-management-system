
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export default function Auth() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    role: 'user', // Default role is user
    areaCode: '', // For municipal/NGO accounts
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      role: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        // Validate pincode for municipal/NGO accounts
        if (formData.role !== 'user' && !formData.areaCode.trim()) {
          throw new Error('Pincode is required for municipal or NGO accounts');
        }

        // Validate pincode format for municipal/NGO accounts
        if (formData.role !== 'user' && !/^\d{6}$/.test(formData.areaCode)) {
          throw new Error('Please enter a valid 6-digit pincode');
        }

        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              username: formData.username,
              role: formData.role,
              areaCode: formData.areaCode,
            },
          },
        });
        
        if (error) throw error;
        
        if (data.user?.identities?.length === 0) {
          toast({
            variant: "destructive",
            title: "Account already exists",
            description: "Please sign in instead.",
          });
          setIsSignUp(false);
        } else {
          // After successful signup, update the profiles table with username, account_type and area_code
          if (data.user) {
            const { error: profileError } = await supabase
              .from('profiles')
              .upsert({
                id: data.user.id,
                username: formData.username,
                account_type: formData.role,
                area_code: formData.areaCode,
              });
              
            if (profileError) throw profileError;
          }
          
          toast({
            title: "Account created!",
            description: "You can now sign in with your credentials.",
            variant: "success",
          });
          setIsSignUp(false);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        
        if (error) {
          if (error.message === 'Invalid login credentials') {
            throw new Error('Invalid email or password. Please try again.');
          }
          throw error;
        }
        
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
          variant: "success",
        });
        navigate('/');
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

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
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium">
                  Username
                </label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  required={isSignUp}
                  placeholder="johndoe"
                  value={formData.username}
                  onChange={handleInputChange}
                  minLength={3}
                />
              </div>
              
              <div className="space-y-3">
                <label className="text-sm font-medium">Account Type</label>
                <RadioGroup 
                  value={formData.role} 
                  onValueChange={handleRoleChange}
                  className="flex flex-col space-y-1"
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
              
              {(formData.role === 'municipal' || formData.role === 'ngo') && (
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
                    value={formData.areaCode}
                    onChange={handleInputChange}
                    pattern="[0-9]{6}"
                    maxLength={6}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the pincode of the area your organization is responsible for.
                  </p>
                </div>
              )}
            </>
          )}
          
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
              value={formData.email}
              onChange={handleInputChange}
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
              value={formData.password}
              onChange={handleInputChange}
              minLength={6}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isSignUp ? 'Creating account...' : 'Signing in...'}
              </>
            ) : (
              <>{isSignUp ? 'Sign Up' : 'Sign In'}</>
            )}
          </Button>
        </form>

        <div className="text-center">
          <Button
            variant="link"
            className="text-sm"
            onClick={() => setIsSignUp(!isSignUp)}
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
