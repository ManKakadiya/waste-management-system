
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, UserCircle, MapPin, Building, User as UserIcon } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isEditing, setIsEditing] = useState(false);
  
  // Redirect if not logged in
  if (!user) {
    navigate('/auth');
    return null;
  }
  
  // Fetch profile data
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      return data;
    }
  });
  
  const [formData, setFormData] = useState({
    areaCode: profile?.area_code || user?.areaCode || '',
  });
  
  // Update when profile is loaded
  if (profile && !isLoading && formData.areaCode === '' && profile.area_code) {
    setFormData({
      areaCode: profile.area_code,
    });
  }
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (updateData: { area_code: string }) => {
      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);
        
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user.id] });
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
        variant: 'success',
      });
      setIsEditing(false);
    },
    onError: (error) => {
      toast({
        title: 'Update failed',
        description: error.message || 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    }
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (profile?.account_type === 'municipal' || profile?.account_type === 'ngo') {
      if (!formData.areaCode.trim()) {
        toast({
          title: 'Validation Error',
          description: 'Area code is required for municipal and NGO accounts',
          variant: 'destructive',
        });
        return;
      }
      
      // Validate pincode format
      if (!/^\d{6}$/.test(formData.areaCode)) {
        toast({
          title: 'Validation Error',
          description: 'Please enter a valid 6-digit area code',
          variant: 'destructive',
        });
        return;
      }
    }
    
    // Update profile
    updateProfileMutation.mutate({
      area_code: formData.areaCode,
    });
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  const accountType = profile?.account_type || user?.role || 'user';
  const isOrganization = accountType === 'municipal' || accountType === 'ngo';
  
  return (
    <div className="container max-w-2xl py-10 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Your Profile</h1>
        <p className="text-muted-foreground mt-2">
          View and manage your account details
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isOrganization ? (
              <Building className="h-5 w-5 text-primary" />
            ) : (
              <UserIcon className="h-5 w-5 text-primary" />
            )}
            {profile?.username || user?.username || 'User'}
          </CardTitle>
          <CardDescription>
            Account type: {accountType === 'municipal' 
              ? 'Municipal Corporation' 
              : accountType === 'ngo' 
                ? 'NGO / Waste Management Organization' 
                : 'Individual User'}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username - Read-only */}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                value={profile?.username || user?.username || ''}
                readOnly
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Username cannot be changed after account creation
              </p>
            </div>
            
            {/* Account Type - Read-only */}
            <div className="space-y-2">
              <Label htmlFor="accountType">Account Type</Label>
              <Input
                id="accountType"
                name="accountType"
                value={accountType === 'municipal' 
                  ? 'Municipal Corporation' 
                  : accountType === 'ngo' 
                    ? 'NGO / Waste Management Organization' 
                    : 'Individual User'}
                readOnly
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Account type cannot be changed
              </p>
            </div>
            
            {/* Area Code - Editable only for municipal/NGO */}
            {isOrganization && (
              <div className="space-y-2">
                <Label htmlFor="areaCode">Area Code</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="areaCode"
                    name="areaCode"
                    value={formData.areaCode}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                    disabled={!isEditing || updateProfileMutation.isPending}
                    className={!isEditing ? "bg-muted pl-10" : "pl-10"}
                    placeholder="Enter 6-digit area code"
                    maxLength={6}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  The area code determines which complaints you can manage
                </p>
              </div>
            )}
            
            {/* Email - Read-only */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                value={user?.email || ''}
                readOnly
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Email is managed through your account settings
              </p>
            </div>
            
            {isEditing && (
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      areaCode: profile?.area_code || user?.areaCode || '',
                    });
                  }}
                  disabled={updateProfileMutation.isPending}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            )}
          </form>
        </CardContent>
        
        {!isEditing && isOrganization && (
          <CardFooter className="flex justify-end border-t p-4">
            <Button 
              onClick={() => setIsEditing(true)}
              variant="outline"
            >
              Edit Profile
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default Profile;
