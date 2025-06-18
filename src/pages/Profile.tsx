import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, MapPin, Phone, Mail, Calendar, Settings, Edit, Save, X,
  Plus, Trash2, Home, Building, Star
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { UserProfile, UserAddress } from '../types';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';

const Profile = () => {
  const navigate = useNavigate();
  const { user, profile, logout, isLoading: authLoading } = useAuth();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [changePasswordForm, setChangePasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    newsletter: false,
    marketingEmails: false,
    notifications: false,
    avatar: profile?.avatar || '',
  });

  const [addressData, setAddressData] = useState({
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    isDefault: false,
    label: '',
  });

  // Load user data
  useEffect(() => {
    // Wait for authentication to finish loading before checking user state
    if (authLoading) return;
    
    if (!user) {
      navigate('/login');
      toast.error('Please login to access your profile');
      return;
    }

    // Load profile data
    if (profile) {
      setProfileData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phone: profile.phone || '',
        dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : '',
        gender: profile.gender || '',
        newsletter: profile.preferences?.newsletter || false,
        marketingEmails: profile.preferences?.marketingEmails || false,
        notifications: profile.preferences?.notifications || false,
        avatar: profile.avatar || '',
      });
    }

    // Load sample addresses
    const sampleAddresses: UserAddress[] = [
      {
        id: '1',
        userId: user.id,
        addressLine1: '123 Main Street',
        addressLine2: 'Apartment 4B',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400001',
        country: 'India',
        isDefault: true,
        label: 'Home',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
      {
        id: '2',
        userId: user.id,
        addressLine1: '456 Business Park',
        addressLine2: 'Floor 3, Suite 301',
        city: 'Delhi',
        state: 'Delhi',
        postalCode: '110001',
        country: 'India',
        isDefault: false,
        label: 'Office',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
      },
    ];
    setAddresses(sampleAddresses);
  }, [user, profile, navigate, authLoading]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update profile in localStorage
      const updatedProfile: UserProfile = {
        ...profile!,
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phone: profileData.phone,
        dateOfBirth: profileData.dateOfBirth ? new Date(profileData.dateOfBirth) : undefined,
        gender: profileData.gender as 'male' | 'female' | 'other' | undefined,
        avatar: profileData.avatar,
        preferences: {
          newsletter: profileData.newsletter,
          marketingEmails: profileData.marketingEmails,
          notifications: profileData.notifications,
        },
        updatedAt: new Date(),
      };
      
      localStorage.setItem('furnicraft_profile', JSON.stringify(updatedProfile));
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (editingAddress) {
        // Update existing address
        const updatedAddresses = addresses.map(addr => 
          addr.id === editingAddress.id 
            ? { ...addr, ...addressData, updatedAt: new Date() }
            : addr
        );
        setAddresses(updatedAddresses);
        toast.success('Address updated successfully!');
      } else {
        // Add new address
        const newAddress: UserAddress = {
          id: Date.now().toString(),
          userId: user!.id,
          ...addressData,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setAddresses([...addresses, newAddress]);
        toast.success('Address added successfully!');
      }
      
      setShowAddressForm(false);
      setEditingAddress(null);
      resetAddressForm();
    } catch (error) {
      console.error('Error saving address:', error);
      toast.error('Failed to save address');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddressEdit = (address: UserAddress) => {
    setEditingAddress(address);
    setAddressData({
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || '',
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      isDefault: address.isDefault,
      label: address.label || '',
    });
    setShowAddressForm(true);
  };

  const handleAddressDelete = async (addressId: string) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        const updatedAddresses = addresses.filter(addr => addr.id !== addressId);
        setAddresses(updatedAddresses);
        toast.success('Address deleted successfully!');
      } catch (error) {
        console.error('Error deleting address:', error);
        toast.error('Failed to delete address');
      }
    }
  };

  const resetAddressForm = () => {
    setAddressData({
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
      isDefault: false,
      label: '',
    });
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (changePasswordForm.newPassword !== changePasswordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (changePasswordForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }
    
    if (changePasswordForm.currentPassword === changePasswordForm.newPassword) {
      toast.error('New password must be different from current password');
      return;
    }
    
    setIsChangingPassword(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, we'll just show success message
      // In a real app, you would validate the current password and update it
      toast.success('Password changed successfully!');
      
      // Reset form
      setChangePasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowChangePassword(false);
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Failed to change password. Please try again.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Show loading state while authentication is being restored
  if (authLoading) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="bg-gray-300 h-8 w-32 rounded mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="space-y-4">
                    <div className="bg-gray-300 h-4 rounded w-1/4"></div>
                    <div className="bg-gray-300 h-4 rounded w-3/4"></div>
                    <div className="bg-gray-300 h-4 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 h-64"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowSettings(true)}>
                <Settings size={16} className="mr-2" />
                Settings
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Personal Info</TabsTrigger>
              <TabsTrigger value="addresses">Addresses</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>

            {/* Personal Info Tab */}
            <TabsContent value="profile" className="flex justify-center items-start py-8">
              <Card className="w-full max-w-2xl mx-auto card-elevated glass p-8 shadow-xl border border-emerald-100">
                <CardHeader>
                  <div className="flex flex-col items-center mb-4">
                    <Avatar className="w-28 h-28 mb-2 ring-4 ring-emerald-100 shadow-lg bg-white/80">
                      {profileData.avatar ? (
                        <AvatarImage src={profileData.avatar} alt={profileData.firstName + ' ' + profileData.lastName} />
                      ) : (
                        <AvatarFallback>{profileData.firstName?.charAt(0)}{profileData.lastName?.charAt(0)}</AvatarFallback>
                      )}
                    </Avatar>
                  </div>
                  <div className="flex justify-between items-center w-full">
                    <CardTitle className="flex items-center gap-2">
                      <User size={20} />
                      Personal Information
                    </CardTitle>
                    {!isEditing && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setIsEditing(true)}
                      >
                        <Edit size={16} className="mr-2" />
                        Edit
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <form onSubmit={handleProfileSubmit} className="space-y-4">
                      <div className="flex flex-col items-center mb-4">
                        <Avatar className="w-24 h-24 mb-2">
                          {profileData.avatar ? (
                            <AvatarImage src={profileData.avatar} alt={profileData.firstName + ' ' + profileData.lastName} />
                          ) : (
                            <AvatarFallback>{profileData.firstName?.charAt(0)}{profileData.lastName?.charAt(0)}</AvatarFallback>
                          )}
                        </Avatar>
                        {isEditing && (
                          <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (ev) => {
                                  setProfileData(prev => ({ ...prev, avatar: ev.target?.result as string }));
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="mt-2"
                          />
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">First Name *</Label>
                          <Input
                            id="firstName"
                            value={profileData.firstName}
                            onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName">Last Name *</Label>
                          <Input
                            id="lastName"
                            value={profileData.lastName}
                            onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            value={profileData.phone}
                            onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            value={user.email}
                            disabled
                            className="bg-gray-50"
                          />
                        </div>
                        <div>
                          <Label htmlFor="dateOfBirth">Date of Birth</Label>
                          <Input
                            id="dateOfBirth"
                            type="date"
                            value={profileData.dateOfBirth}
                            onChange={(e) => setProfileData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="gender">Gender</Label>
                          <Select
                            value={profileData.gender}
                            onValueChange={(value) => setProfileData(prev => ({ ...prev, gender: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="flex space-x-4">
                        <Button type="submit" disabled={isLoading}>
                          {isLoading ? 'Saving...' : 'Save Changes'}
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsEditing(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-500">First Name</Label>
                          <p className="text-gray-900">{profileData.firstName || 'Not provided'}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Last Name</Label>
                          <p className="text-gray-900">{profileData.lastName || 'Not provided'}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Email</Label>
                          <p className="text-gray-900">{user.email}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Phone</Label>
                          <p className="text-gray-900">{profileData.phone || 'Not provided'}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Date of Birth</Label>
                          <p className="text-gray-900">
                            {profileData.dateOfBirth ? new Date(profileData.dateOfBirth).toLocaleDateString() : 'Not provided'}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Gender</Label>
                          <p className="text-gray-900 capitalize">{profileData.gender || 'Not provided'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Addresses Tab */}
            <TabsContent value="addresses" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">My Addresses</h2>
                <Button onClick={() => setShowAddressForm(true)}>
                  <Plus size={16} className="mr-2" />
                  Add Address
                </Button>
              </div>

              {/* Address Form */}
              {showAddressForm && (
                <Card>
                  <CardHeader>
                    <CardTitle>{editingAddress ? 'Edit Address' : 'Add New Address'}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleAddressSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="label">Address Label</Label>
                          <Input
                            id="label"
                            value={addressData.label}
                            onChange={(e) => setAddressData(prev => ({ ...prev, label: e.target.value }))}
                            placeholder="e.g., Home, Office"
                          />
                        </div>
                        <div>
                          <Label htmlFor="addressLine1">Address Line 1 *</Label>
                          <Input
                            id="addressLine1"
                            value={addressData.addressLine1}
                            onChange={(e) => setAddressData(prev => ({ ...prev, addressLine1: e.target.value }))}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="addressLine2">Address Line 2</Label>
                          <Input
                            id="addressLine2"
                            value={addressData.addressLine2}
                            onChange={(e) => setAddressData(prev => ({ ...prev, addressLine2: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="city">City *</Label>
                          <Input
                            id="city"
                            value={addressData.city}
                            onChange={(e) => setAddressData(prev => ({ ...prev, city: e.target.value }))}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="state">State *</Label>
                          <Input
                            id="state"
                            value={addressData.state}
                            onChange={(e) => setAddressData(prev => ({ ...prev, state: e.target.value }))}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="postalCode">Postal Code *</Label>
                          <Input
                            id="postalCode"
                            value={addressData.postalCode}
                            onChange={(e) => setAddressData(prev => ({ ...prev, postalCode: e.target.value }))}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="country">Country</Label>
                          <Input
                            id="country"
                            value={addressData.country}
                            onChange={(e) => setAddressData(prev => ({ ...prev, country: e.target.value }))}
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="isDefault"
                          checked={addressData.isDefault}
                          onChange={(e) => setAddressData(prev => ({ ...prev, isDefault: e.target.checked }))}
                          className="rounded"
                        />
                        <Label htmlFor="isDefault">Set as default address</Label>
                      </div>
                      
                      <div className="flex space-x-4">
                        <Button type="submit" disabled={isLoading}>
                          {isLoading ? 'Saving...' : (editingAddress ? 'Update Address' : 'Add Address')}
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => {
                            setShowAddressForm(false);
                            setEditingAddress(null);
                            resetAddressForm();
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* Addresses List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((address) => (
                  <Card key={address.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          {address.label === 'Home' ? (
                            <Home size={16} className="text-blue-600" />
                          ) : address.label === 'Office' ? (
                            <Building size={16} className="text-green-600" />
                          ) : (
                            <MapPin size={16} className="text-gray-600" />
                          )}
                          <span className="font-medium">{address.label}</span>
                          {address.isDefault && (
                            <Badge className="bg-emerald-100 text-emerald-800">
                              Default
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAddressEdit(address)}
                          >
                            <Edit size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAddressDelete(address.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>{address.addressLine1}</p>
                        {address.addressLine2 && <p>{address.addressLine2}</p>}
                        <p>{address.city}, {address.state} {address.postalCode}</p>
                        <p>{address.country}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Preferences Tab */}
            <TabsContent value="preferences" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">Email Newsletter</Label>
                        <p className="text-sm text-gray-500">Receive updates about new products and offers</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={profileData.newsletter}
                        onChange={(e) => setProfileData(prev => ({ ...prev, newsletter: e.target.checked }))}
                        className="rounded"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">Marketing Emails</Label>
                        <p className="text-sm text-gray-500">Receive promotional emails and special offers</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={profileData.marketingEmails}
                        onChange={(e) => setProfileData(prev => ({ ...prev, marketingEmails: e.target.checked }))}
                        className="rounded"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">Order Notifications</Label>
                        <p className="text-sm text-gray-500">Get notified about order status updates</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={profileData.notifications}
                        onChange={(e) => setProfileData(prev => ({ ...prev, notifications: e.target.checked }))}
                        className="rounded"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <Footer />

      {/* Settings Modal */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Account Settings</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {/* Change Password Section */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-gray-800">Change Password</h4>
                  <p className="text-sm text-gray-500">Update your account password</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowChangePassword(!showChangePassword)}
                >
                  {showChangePassword ? 'Cancel' : 'Change'}
                </Button>
              </div>
              
              {showChangePassword && (
                <form onSubmit={handleChangePassword} className="space-y-3 p-3 border rounded-lg bg-gray-50">
                  <div>
                    <Label htmlFor="currentPassword" className="text-sm font-medium">
                      Current Password
                    </Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={changePasswordForm.currentPassword}
                      onChange={(e) => setChangePasswordForm(prev => ({ 
                        ...prev, 
                        currentPassword: e.target.value 
                      }))}
                      required
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="newPassword" className="text-sm font-medium">
                      New Password
                    </Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={changePasswordForm.newPassword}
                      onChange={(e) => setChangePasswordForm(prev => ({ 
                        ...prev, 
                        newPassword: e.target.value 
                      }))}
                      required
                      minLength={6}
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Must be at least 6 characters long
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="confirmPassword" className="text-sm font-medium">
                      Confirm New Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={changePasswordForm.confirmPassword}
                      onChange={(e) => setChangePasswordForm(prev => ({ 
                        ...prev, 
                        confirmPassword: e.target.value 
                      }))}
                      required
                      className="mt-1"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={isChangingPassword}
                    className="w-full bg-emerald-700 hover:bg-emerald-800"
                  >
                    {isChangingPassword ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Changing Password...
                      </div>
                    ) : (
                      'Change Password'
                    )}
                  </Button>
                </form>
              )}
            </div>

            {/* Delete Account Section */}
            <div className="pt-4 border-t">
              {user?.role !== 'admin' && (
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-red-800">Delete Account</h4>
                    <p className="text-sm text-gray-500">Permanently delete your account and all data</p>
                  </div>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                        // Full cleanup logic
                        if (user) {
                          // Remove from dynamic users
                          const dynamicUsers = JSON.parse(localStorage.getItem('furnicraft_dynamic_users') || '[]');
                          const updatedUsers = dynamicUsers.filter((u: any) => u.email !== user.email);
                          localStorage.setItem('furnicraft_dynamic_users', JSON.stringify(updatedUsers));
                          // Remove from dynamic profiles
                          const dynamicProfiles = JSON.parse(localStorage.getItem('furnicraft_dynamic_profiles') || '[]');
                          const updatedProfiles = dynamicProfiles.filter((p: any) => p.userId !== user.id);
                          localStorage.setItem('furnicraft_dynamic_profiles', JSON.stringify(updatedProfiles));
                          // Remove cart
                          localStorage.removeItem(`furnicraft_cart_${user.id}`);
                          // Remove order history
                          localStorage.removeItem(`furnicraft_orders_${user.email}`);
                        }
                        logout();
                      }
                    }}
                  >
                    <Trash2 size={16} className="mr-2" /> Delete Account
                  </Button>
                </div>
              )}
              {user?.role === 'admin' && (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">Account deletion is not available for admin users.</p>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettings(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
