import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, Settings, Lock, Shield, Bell, Heart } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { toast } from 'sonner';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Package, LogOut } from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState('profile');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { user, profile, logout } = useAuth();
  const { cart, getItemCount } = useCart();
  const { getWishlistCount } = useWishlist();

  const cartItemsCount = getItemCount();

  // Settings form data
  const [settingsData, setSettingsData] = useState({
    firstName: profile?.firstName || '',
    lastName: profile?.lastName || '',
    email: user?.email || '',
    phone: profile?.phone || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    newsletter: profile?.preferences?.newsletter || false,
    marketingEmails: profile?.preferences?.marketingEmails || false,
    notifications: profile?.preferences?.notifications || false,
  });

  // Update settings data when profile changes
  useEffect(() => {
    setSettingsData({
      firstName: profile?.firstName || '',
      lastName: profile?.lastName || '',
      email: user?.email || '',
      phone: profile?.phone || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      newsletter: profile?.preferences?.newsletter || false,
      marketingEmails: profile?.preferences?.marketingEmails || false,
      notifications: profile?.preferences?.notifications || false,
    });
  }, [profile, user]);

  // Settings handlers
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update profile in localStorage
      const updatedProfile = {
        ...profile!,
        firstName: settingsData.firstName,
        lastName: settingsData.lastName,
        phone: settingsData.phone,
        preferences: {
          newsletter: settingsData.newsletter,
          marketingEmails: settingsData.marketingEmails,
          notifications: settingsData.notifications,
        },
        updatedAt: new Date(),
      };
      
      localStorage.setItem('furnicraft_profile', JSON.stringify(updatedProfile));
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (settingsData.newPassword !== settingsData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (settingsData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    
    setIsUpdatingPassword(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update password in localStorage (in real app, this would be an API call)
      const storedPasswords = JSON.parse(localStorage.getItem('furnicraft_dynamic_passwords') || '{}');
      storedPasswords[user!.email] = settingsData.newPassword;
      localStorage.setItem('furnicraft_dynamic_passwords', JSON.stringify(storedPasswords));
      
      toast.success('Password updated successfully!');
      setSettingsData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error('Failed to update password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }
    
    setIsDeletingAccount(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Account deleted successfully');
      logout();
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account');
    } finally {
      setIsDeletingAccount(false);
    }
  };

  // Get display name from user profile or email
  const getDisplayName = () => {
    if (!user) return '';
    if (profile?.firstName) {
      return profile.firstName;
    }
    return user.email.split('@')[0]; // Show part before @
  };

  return (
    <>
      <nav className="glass shadow-lg sticky top-0 z-50 border-b border-emerald-100 backdrop-blur-md">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="text-2xl font-bold text-emerald-700">
              FurniCraft
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-gray-700 hover:text-emerald-700 transition-colors">
                Home
              </Link>
              <Link to="/products" className="text-gray-700 hover:text-emerald-700 transition-colors">
                Products
              </Link>
              {user && (
                <Link to="/orders" className="text-gray-700 hover:text-emerald-700 transition-colors">
                  My Orders
                </Link>
              )}
              {user?.role === 'admin' && (
                <Link to="/admin" className="text-gray-700 hover:text-emerald-700 transition-colors">
                  Admin
                </Link>
              )}
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/wishlist" className="relative p-2 text-gray-700 hover:text-emerald-700 transition-colors">
                <Heart size={24} />
                {getWishlistCount() > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500 text-white">
                    {getWishlistCount()}
                  </Badge>
                )}
              </Link>
              <Link to="/cart" className="relative p-2 text-gray-700 hover:text-emerald-700 transition-colors">
                <ShoppingCart size={24} />
                {cartItemsCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-emerald-500 text-white">
                    {cartItemsCount}
                  </Badge>
                )}
              </Link>
              
              {user ? (
                <div className="flex items-center space-x-2">
                  <Link to="/profile" className="flex items-center group">
                    <Avatar className="w-9 h-9 ring-2 ring-emerald-200 group-hover:ring-emerald-400 transition-all duration-200">
                      {profile?.avatar ? (
                        <AvatarImage src={profile.avatar} alt={getDisplayName()} />
                      ) : (
                        <AvatarFallback>{getDisplayName().charAt(0)}</AvatarFallback>
                      )}
                    </Avatar>
                  </Link>
                  <button
                    onClick={logout}
                    className="text-gray-700 hover:text-emerald-700 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link to="/login" className="flex items-center space-x-1 text-gray-700 hover:text-emerald-700 transition-colors">
                  <User size={20} />
                  <span>Login</span>
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t">
              <div className="flex flex-col space-y-4">
                <Link to="/" className="text-gray-700 hover:text-emerald-700 transition-colors" onClick={() => setIsMenuOpen(false)}>
                  Home
                </Link>
                <Link to="/products" className="text-gray-700 hover:text-emerald-700 transition-colors" onClick={() => setIsMenuOpen(false)}>
                  Products
                </Link>
                {user && (
                  <Link to="/orders" className="text-gray-700 hover:text-emerald-700 transition-colors" onClick={() => setIsMenuOpen(false)}>
                    My Orders
                  </Link>
                )}
                {user?.role === 'admin' && (
                  <Link to="/admin" className="text-gray-700 hover:text-emerald-700 transition-colors" onClick={() => setIsMenuOpen(false)}>
                    Admin
                  </Link>
                )}
                <Link to="/wishlist" className="flex items-center space-x-2 text-gray-700 hover:text-emerald-700 transition-colors" onClick={() => setIsMenuOpen(false)}>
                  <Heart size={20} />
                  <span>Wishlist ({getWishlistCount()})</span>
                </Link>
                <Link to="/cart" className="flex items-center space-x-2 text-gray-700 hover:text-emerald-700 transition-colors" onClick={() => setIsMenuOpen(false)}>
                  <ShoppingCart size={20} />
                  <span>Cart ({cartItemsCount})</span>
                </Link>
                {user ? (
                  <div className="flex flex-col space-y-2">
                    <Link to="/profile" className="flex items-center" onClick={() => setIsMenuOpen(false)}>
                      <Avatar className="w-9 h-9">
                        {profile?.avatar ? (
                          <AvatarImage src={profile.avatar} alt={getDisplayName()} />
                        ) : (
                          <AvatarFallback>{getDisplayName().charAt(0)}</AvatarFallback>
                        )}
                      </Avatar>
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                      className="text-left text-gray-700 hover:text-emerald-700 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <Link to="/login" className="flex items-center space-x-2 text-gray-700 hover:text-emerald-700 transition-colors" onClick={() => setIsMenuOpen(false)}>
                    <User size={20} />
                    <span>Login</span>
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Settings Modal */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings size={20} />
              Account Settings
            </DialogTitle>
            <DialogDescription>
              Manage your account settings and preferences
            </DialogDescription>
          </DialogHeader>
          
          <Tabs value={settingsTab} onValueChange={setSettingsTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1">
              <TabsTrigger value="profile" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <User size={14} className="sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Profile</span>
                <span className="sm:hidden">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <Lock size={14} className="sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Security</span>
                <span className="sm:hidden">Security</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <Bell size={14} className="sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Notifications</span>
                <span className="sm:hidden">Notif</span>
              </TabsTrigger>
              <TabsTrigger value="danger" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-red-600">
                <Shield size={14} className="sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Danger Zone</span>
                <span className="sm:hidden">Danger</span>
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-4">
              <form onSubmit={handleProfileUpdate}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={settingsData.firstName}
                      onChange={(e) => setSettingsData(prev => ({ ...prev, firstName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={settingsData.lastName}
                      onChange={(e) => setSettingsData(prev => ({ ...prev, lastName: e.target.value }))}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={settingsData.email}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={settingsData.phone}
                      onChange={(e) => setSettingsData(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4">
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                    <Link to="/profile" className="text-sm text-emerald-600 hover:text-emerald-700">
                      View Full Profile →
                    </Link>
                    <Link to="/orders" className="text-sm text-emerald-600 hover:text-emerald-700">
                      View Order History →
                    </Link>
                  </div>
                  <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                    {isLoading ? 'Updating...' : 'Update Profile'}
                  </Button>
                </div>
              </form>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-4">
              <form onSubmit={handlePasswordUpdate}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={settingsData.currentPassword}
                      onChange={(e) => setSettingsData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={settingsData.newPassword}
                      onChange={(e) => setSettingsData(prev => ({ ...prev, newPassword: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={settingsData.confirmPassword}
                      onChange={(e) => setSettingsData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <Button type="submit" disabled={isUpdatingPassword} className="w-full sm:w-auto">
                    {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                  </Button>
                </div>
              </form>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-4">
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-4">
                  <div className="flex-1">
                    <Label className="text-sm font-medium">Email Newsletter</Label>
                    <p className="text-sm text-gray-500">Receive updates about new products and offers</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settingsData.newsletter}
                    onChange={(e) => setSettingsData(prev => ({ ...prev, newsletter: e.target.checked }))}
                    className="rounded"
                  />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-4">
                  <div className="flex-1">
                    <Label className="text-sm font-medium">Marketing Emails</Label>
                    <p className="text-sm text-gray-500">Receive promotional emails and special offers</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settingsData.marketingEmails}
                    onChange={(e) => setSettingsData(prev => ({ ...prev, marketingEmails: e.target.checked }))}
                    className="rounded"
                  />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-4">
                  <div className="flex-1">
                    <Label className="text-sm font-medium">Order Notifications</Label>
                    <p className="text-sm text-gray-500">Get notified about order status updates</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settingsData.notifications}
                    onChange={(e) => setSettingsData(prev => ({ ...prev, notifications: e.target.checked }))}
                    className="rounded"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleProfileUpdate} disabled={isLoading} className="w-full sm:w-auto">
                  {isLoading ? 'Saving...' : 'Save Preferences'}
                </Button>
              </div>
            </TabsContent>

            {/* Danger Zone Tab */}
            <TabsContent value="danger" className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-red-800 mb-2">Danger Zone</h3>
                <p className="text-red-600 mb-4">
                  These actions are irreversible. Please proceed with caution.
                </p>
                
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-red-200 rounded-lg gap-4">
                    <div className="flex-1">
                      <h4 className="font-medium text-red-800">Delete Account</h4>
                      <p className="text-sm text-red-600">
                        Permanently delete your account and all associated data
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      onClick={handleDeleteAccount}
                      disabled={isDeletingAccount}
                      className="w-full sm:w-auto"
                    >
                      {isDeletingAccount ? 'Deleting...' : 'Delete Account'}
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettings(false)} className="w-full sm:w-auto">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Navbar;
