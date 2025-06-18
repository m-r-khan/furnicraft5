import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserProfile } from '../types';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  debugUsers: () => void;
  resetAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Sample users for demo purposes
const sampleUsers: User[] = [
  {
    id: '1',
    email: 'admin@furnicraft.com',
    role: 'admin',
    isEmailVerified: true,
    isActive: true,
    failedLoginAttempts: 0,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    email: 'user@test.com',
    role: 'customer',
    isEmailVerified: true,
    isActive: true,
    failedLoginAttempts: 0,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

const sampleProfiles: UserProfile[] = [
  {
    id: '1',
    userId: '1',
    firstName: 'Admin',
    lastName: 'User',
    preferences: {
      newsletter: true,
      marketingEmails: false,
      notifications: true,
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    userId: '2',
    firstName: 'Test',
    lastName: 'User',
    preferences: {
      newsletter: true,
      marketingEmails: false,
      notifications: true,
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

const samplePasswords: Record<string, string> = {
  'admin@furnicraft.com': 'admin123',
  'user@test.com': 'user123',
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for stored auth data on app load
  useEffect(() => {
    const storedUser = localStorage.getItem('furnicraft_user');
    const storedProfile = localStorage.getItem('furnicraft_profile');
    
    if (storedUser && storedProfile) {
      try {
        setUser(JSON.parse(storedUser));
        setProfile(JSON.parse(storedProfile));
      } catch (error) {
        console.error('Error parsing stored auth data:', error);
        localStorage.removeItem('furnicraft_user');
        localStorage.removeItem('furnicraft_profile');
      }
    }
    setIsLoading(false);
  }, []);

  // Helper function to get all users (sample + dynamic)
  const getAllUsers = () => {
    const storedDynamicUsers = localStorage.getItem('furnicraft_dynamic_users');
    let dynamicUsers: User[] = [];
    
    if (storedDynamicUsers) {
      try {
        dynamicUsers = JSON.parse(storedDynamicUsers);
      } catch (error) {
        console.error('Error parsing dynamic users:', error);
      }
    }
    
    return [...sampleUsers, ...dynamicUsers];
  };

  // Helper function to get all profiles (sample + dynamic)
  const getAllProfiles = () => {
    const storedDynamicProfiles = localStorage.getItem('furnicraft_dynamic_profiles');
    let dynamicProfiles: UserProfile[] = [];
    
    if (storedDynamicProfiles) {
      try {
        dynamicProfiles = JSON.parse(storedDynamicProfiles);
      } catch (error) {
        console.error('Error parsing dynamic profiles:', error);
      }
    }
    
    return [...sampleProfiles, ...dynamicProfiles];
  };

  // Helper function to get all passwords (sample + dynamic)
  const getAllPasswords = () => {
    const storedDynamicPasswords = localStorage.getItem('furnicraft_dynamic_passwords');
    let dynamicPasswords: Record<string, string> = {};
    
    if (storedDynamicPasswords) {
      try {
        dynamicPasswords = JSON.parse(storedDynamicPasswords);
      } catch (error) {
        console.error('Error parsing dynamic passwords:', error);
      }
    }
    
    return { ...samplePasswords, ...dynamicPasswords };
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      console.log('Login attempt for:', email);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Get all users and passwords
      const allUsers = getAllUsers();
      const allProfiles = getAllProfiles();
      const allPasswords = getAllPasswords();
      
      console.log('Total users available:', allUsers.length);
      console.log('Total passwords available:', Object.keys(allPasswords).length);
      console.log('All user emails:', allUsers.map(u => u.email));
      console.log('All password keys:', Object.keys(allPasswords));
      
      // Find user
      const foundUser = allUsers.find(u => u.email === email);
      const foundProfile = allProfiles.find(p => p.userId === foundUser?.id);
      const correctPassword = allPasswords[email];
      
      console.log('Login check:', {
        foundUser: !!foundUser,
        userEmail: foundUser?.email,
        userId: foundUser?.id,
        hasCorrectPassword: password === correctPassword,
        correctPassword: correctPassword,
        inputPassword: password
      });
      
      if (!foundUser || password !== correctPassword) {
        console.log('Login failed: Invalid credentials');
        console.log('Debug info:', {
          foundUser: foundUser,
          correctPassword: correctPassword,
          inputPassword: password,
          passwordMatch: password === correctPassword
        });
        toast.error('Invalid email or password');
        return false;
      }
      
      if (!foundUser.isActive) {
        console.log('Login failed: Account deactivated');
        toast.error('Account is deactivated');
        return false;
      }
      
      console.log('Login successful for:', foundUser.email);
      
      // Store in localStorage
      localStorage.setItem('furnicraft_user', JSON.stringify(foundUser));
      if (foundProfile) {
        localStorage.setItem('furnicraft_profile', JSON.stringify(foundProfile));
      }
      
      setUser(foundUser);
      setProfile(foundProfile || null);
      toast.success(`Welcome back, ${foundProfile?.firstName || foundUser.email}!`);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      console.log('Signup attempt for:', email);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Get all users to check for existing email
      const allUsers = getAllUsers();
      const allPasswords = getAllPasswords();
      
      console.log('Checking against total users:', allUsers.length);
      
      // Check if user already exists
      const existingUser = allUsers.find(u => u.email === email);
      if (existingUser) {
        console.log('Signup failed: User already exists');
        toast.error('User with this email already exists');
        return false;
      }
      
      console.log('Creating new user account');
      
      // Create new user
      const newUser: User = {
        id: Date.now().toString(),
        email,
        role: 'customer',
        isEmailVerified: true,
        isActive: true,
        failedLoginAttempts: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      // Create user profile
      const [firstName, ...lastNameParts] = name.split(' ');
      const lastName = lastNameParts.join(' ') || '';
      
      const newProfile: UserProfile = {
        id: Date.now().toString(),
        userId: newUser.id,
        firstName,
        lastName,
        preferences: {
          newsletter: true,
          marketingEmails: false,
          notifications: true,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      // Get existing dynamic data
      const storedDynamicUsers = localStorage.getItem('furnicraft_dynamic_users');
      const storedDynamicProfiles = localStorage.getItem('furnicraft_dynamic_profiles');
      const storedDynamicPasswords = localStorage.getItem('furnicraft_dynamic_passwords');
      
      let existingDynamicUsers: User[] = [];
      let existingDynamicProfiles: UserProfile[] = [];
      let existingDynamicPasswords: Record<string, string> = {};
      
      if (storedDynamicUsers) {
        try {
          existingDynamicUsers = JSON.parse(storedDynamicUsers);
        } catch {}
      }
      if (storedDynamicProfiles) {
        try {
          existingDynamicProfiles = JSON.parse(storedDynamicProfiles);
        } catch {}
      }
      if (storedDynamicPasswords) {
        try {
          existingDynamicPasswords = JSON.parse(storedDynamicPasswords);
        } catch {}
      }
      
      // Add new user to dynamic data
      const updatedDynamicUsers = [...existingDynamicUsers, newUser];
      const updatedDynamicProfiles = [...existingDynamicProfiles, newProfile];
      const updatedDynamicPasswords = { ...existingDynamicPasswords, [email]: password };
      
      // Store in localStorage
      localStorage.setItem('furnicraft_dynamic_users', JSON.stringify(updatedDynamicUsers));
      localStorage.setItem('furnicraft_dynamic_profiles', JSON.stringify(updatedDynamicProfiles));
      localStorage.setItem('furnicraft_dynamic_passwords', JSON.stringify(updatedDynamicPasswords));
      
      console.log('Signup successful for:', newUser.email);
      console.log('Updated dynamic users count:', updatedDynamicUsers.length);
      console.log('Updated dynamic passwords count:', Object.keys(updatedDynamicPasswords).length);
      
      // Auto-login the user after successful signup
      console.log('Auto-logging in user after signup');
      localStorage.setItem('furnicraft_user', JSON.stringify(newUser));
      localStorage.setItem('furnicraft_profile', JSON.stringify(newProfile));
      
      setUser(newUser);
      setProfile(newProfile);
      
      toast.success('Account created successfully! Welcome!');
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      toast.error('Signup failed. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Clear all localStorage items related to the app
    localStorage.removeItem('furnicraft_user');
    localStorage.removeItem('furnicraft_profile');
    
    // Clear cart by removing all cart-related localStorage items
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('furnicraft_cart_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Clear state
    setUser(null);
    setProfile(null);
    
    toast.success('Logged out successfully');
    
    // Force a complete page reload to ensure clean state
    // This is necessary because we need to reset all React state and ensure
    // the dynamic users are properly reloaded from localStorage
    setTimeout(() => {
      window.location.href = '/';
    }, 100);
  };

  const debugUsers = () => {
    console.log('=== DEBUG USERS ===');
    
    // Get all data
    const allUsers = getAllUsers();
    const allProfiles = getAllProfiles();
    const allPasswords = getAllPasswords();
    
    console.log('All users:', allUsers.map(u => ({ id: u.id, email: u.email })));
    console.log('All profiles:', allProfiles.map(p => ({ id: p.id, userId: p.userId, firstName: p.firstName })));
    console.log('All password keys:', Object.keys(allPasswords));
    
    // Also check localStorage directly
    console.log('localStorage contents:');
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('furnicraft_')) {
        console.log(`${key}:`, localStorage.getItem(key));
      }
    }
    
    console.log('=== END DEBUG ===');
  };

  const resetAuth = () => {
    // Clear all localStorage items related to the app
    localStorage.removeItem('furnicraft_user');
    localStorage.removeItem('furnicraft_profile');
    
    // Clear cart by removing all cart-related localStorage items
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('furnicraft_cart_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Clear state
    setUser(null);
    setProfile(null);
    
    toast.success('Authentication data reset successfully');
    
    // Force a complete page reload to ensure clean state
    // This is necessary because we need to reset all React state and ensure
    // the dynamic users are properly reloaded from localStorage
    setTimeout(() => {
      window.location.href = '/';
    }, 100);
  };

  const value = {
    user,
    profile,
    login,
    signup,
    logout,
    isLoading,
    debugUsers,
    resetAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
