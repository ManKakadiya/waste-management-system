
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface FormData {
  email: string;
  password: string;
  username: string;
  role: string;
  areaCode: string;
}

export function useAuthForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    username: '',
    role: 'user',
    areaCode: '',
  });

  // Reset loading state when switching between signup and signin
  useEffect(() => {
    setIsLoading(false);
    setUsernameError('');
  }, [isSignUp]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    
    // Clear username error when user types in the username field
    if (e.target.name === 'username') {
      setUsernameError('');
    }
  };

  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      role: value,
    }));
  };

  // Check if username already exists
  const checkUsernameExists = async (username: string): Promise<boolean> => {
    try {
      setCheckingUsername(true);
      console.log(`Checking if username "${username}" exists...`);
      
      // Check with a case-insensitive search to prevent similar usernames
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .ilike('username', username)
        .maybeSingle();
      
      if (error) {
        console.error("Error checking username:", error);
        return false;
      }
      
      const exists = !!data;
      console.log(`Username "${username}" exists: ${exists}`);
      return exists;
    } catch (error) {
      console.error("Error in username check:", error);
      return false;
    } finally {
      setCheckingUsername(false);
    }
  };

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
    setUsernameError('');
    setFormData({
      email: '',
      password: '',
      username: '',
      role: 'user',
      areaCode: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoading || checkingUsername) return; // Prevent multiple submissions
    
    setIsLoading(true);

    try {
      if (isSignUp) {
        // Validate username format
        if (!formData.username.trim()) {
          setIsLoading(false);
          throw new Error('Username is required');
        }
        
        if (formData.username.length < 3) {
          setIsLoading(false);
          throw new Error('Username must be at least 3 characters long');
        }
        
        // Additional validation to prevent special characters that might cause issues
        const usernameRegex = /^[a-zA-Z0-9_]+$/;
        if (!usernameRegex.test(formData.username)) {
          setIsLoading(false);
          throw new Error('Username can only contain letters, numbers, and underscores');
        }
        
        // Check if username already exists - critical step
        const usernameExists = await checkUsernameExists(formData.username);
        if (usernameExists) {
          setIsLoading(false);
          setUsernameError('This username is already taken. Please choose another one.');
          throw new Error('Username already taken');
        }

        // Validate pincode for municipal/NGO accounts
        if (formData.role !== 'user' && !formData.areaCode.trim()) {
          setIsLoading(false);
          throw new Error('Pincode is required for municipal or NGO accounts');
        }

        // Validate pincode format for municipal/NGO accounts
        if (formData.role !== 'user' && !/^\d{6}$/.test(formData.areaCode)) {
          setIsLoading(false);
          throw new Error('Please enter a valid 6-digit pincode');
        }

        console.log("Attempting to sign up user with data:", {
          email: formData.email,
          username: formData.username,
          role: formData.role,
          areaCode: formData.areaCode
        });

        // Sign up the user
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
        
        if (error) {
          console.error("Signup error:", error);
          throw error;
        }
        
        console.log("Signup response:", data);
        
        if (data?.user?.identities?.length === 0) {
          toast({
            variant: "destructive",
            title: "Account already exists",
            description: "Please sign in instead.",
          });
          setIsSignUp(false);
          setIsLoading(false);
          return;
        } 
        
        if (!data?.user) {
          throw new Error("Failed to create account. Please try again.");
        }
        
        // After successful signup, notify the user - profile creation will happen in AuthWrapper
        toast({
          title: "Account created!",
          description: "You can now sign in with your credentials.",
          variant: "success",
        });
        
        // Switch to sign in mode after successful signup
        setIsSignUp(false);
        setIsLoading(false);
      } else {
        // Sign in the user
        console.log("Attempting to sign in user:", formData.email);
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        
        if (error) {
          console.error("Signin error:", error);
          if (error.message === 'Invalid login credentials') {
            throw new Error('Invalid email or password. Please try again.');
          }
          throw error;
        }
        
        console.log("Signin successful:", data);
        if (data?.user) {
          toast({
            title: "Welcome back!",
            description: "You have successfully signed in.",
            variant: "success",
          });
          navigate('/');
        }
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Authentication failed. Please try again.",
      });
      setIsLoading(false);
    }
  };

  return {
    formData,
    isLoading,
    isSignUp,
    usernameError,
    checkingUsername,
    handleInputChange,
    handleRoleChange,
    handleSubmit,
    toggleAuthMode
  };
}
