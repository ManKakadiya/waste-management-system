
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, UserCircle, Building, User as UserIcon } from 'lucide-react';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ReadOnlyField } from '@/components/profile/ReadOnlyField';
import { AreaCodeField } from '@/components/profile/AreaCodeField';
import { ProfileFormButtons } from '@/components/profile/ProfileFormButtons';
import { ProfileCardFooter } from '@/components/profile/ProfileCardFooter';
import { isOrganizationUser } from '@/lib/auth/types';

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
  
  // Update form data when profile is loaded
  useEffect(() => {
    if (profile && !isLoading) {
      setFormData({
        areaCode: profile.area_code || user?.areaCode || '',
      });
    }
  }, [profile, isLoading, user?.areaCode]);
  
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
    if (isOrganizationUser(profile?.account_type)) {
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
  
  // Get account type from profile data first, falling back to user data
  const accountType = profile?.account_type || user?.role || 'user';
  const userIsOrg = isOrganizationUser(accountType);
  
  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormData({
      areaCode: profile?.area_code || user?.areaCode || '',
    });
  };
  
  return (
    <div className="container max-w-2xl py-10 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Your Profile</h1>
        <p className="text-muted-foreground mt-2">
          View and manage your account details
        </p>
      </div>
      
      <Card>
        <ProfileHeader 
          username={profile?.username || user?.username || 'User'} 
          accountType={accountType}
        />
        
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username - Read-only */}
            <ReadOnlyField
              id="username"
              label="Username"
              value={profile?.username || user?.username || ''}
              icon={<UserCircle className="h-4 w-4" />}
              helperText="Username cannot be changed after account creation"
            />
            
            {/* Account Type - Read-only */}
            <ReadOnlyField
              id="accountType"
              label="Account Type"
              value={accountType === 'municipal' 
                ? 'Municipal Corporation' 
                : accountType === 'ngo' 
                  ? 'NGO / Waste Management Organization' 
                  : 'Individual User'
              }
              icon={userIsOrg ? <Building className="h-4 w-4" /> : <UserIcon className="h-4 w-4" />}
              helperText="Account type cannot be changed"
            />
            
            {/* Area Code - Editable only for municipal/NGO */}
            {userIsOrg && (
              <AreaCodeField
                value={formData.areaCode}
                onChange={handleInputChange}
                isEditing={isEditing}
                isLoading={updateProfileMutation.isPending}
              />
            )}
            
            {/* Email - Read-only */}
            <ReadOnlyField
              id="email"
              label="Email"
              value={user?.email || ''}
              icon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>}
              helperText="Email is managed through your account settings"
            />
            
            <ProfileFormButtons 
              isEditing={isEditing} 
              isLoading={updateProfileMutation.isPending}
              onCancel={handleCancelEdit}
            />
          </form>
        </CardContent>
        
        <ProfileCardFooter 
          isEditing={isEditing} 
          isOrganization={userIsOrg}
          onEdit={() => setIsEditing(true)}
        />
      </Card>
    </div>
  );
};

export default Profile;
