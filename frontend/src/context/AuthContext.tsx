
"use client";
import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import { useRouter, usePathname } from 'next/navigation'; 
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/LanguageContext';

// Define a User type that matches FirebaseUser structure but allows for mock data
interface User extends Partial<FirebaseUser> {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
}

// Payload for updating user profile information
type UpdateUserPayload = Partial<Pick<User, 'displayName' | 'photoURL'>>;

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password?: string, name?: string) => Promise<void>; 
  signOut: () => Promise<void>;
  updateProfile: (payload: UpdateUserPayload) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// List of public paths that don't require authentication
const PUBLIC_PATHS = ['/signin', '/signup']; 
const EMAIL_REGEX = /^[a-zA-Z0-9_.-]+?\.[a-zA-Z0-9_.-]+?@smail\.inf\.h-brs\.de$/;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null); // Initialize with null
  const [loading, setLoading] = useState(true); // Initialize loading to true
  const router = useRouter();
  const pathname = usePathname(); 
  const { toast } = useToast();
  // Language context is initialized AFTER AuthProvider, so we need to get 't' carefully or pass it if needed.
  // For now, we'll use fixed strings for errors in signIn/signOut if t is not available,
  // or make sure LanguageProvider wraps AuthProvider if t is critical here.
  // Let's assume LanguageProvider is available higher up or handle it.
  const { t } = useLanguage(); 


  useEffect(() => {
    const storedUser = localStorage.getItem('hbrs-go-user');
    let initialUser: User | null = null;

    if (storedUser) {
      try {
        initialUser = JSON.parse(storedUser) as User;
      } catch (e) {
        localStorage.removeItem('hbrs-go-user');
        initialUser = null; 
      }
    }
    
    setUser(initialUser);
    setLoading(false); // Set loading to false after attempting to load user
  }, []);


  useEffect(() => {
    // Only perform routing logic if not loading
    if (!loading) {
      if (!user && !PUBLIC_PATHS.includes(pathname)) {
          router.push('/signin');
      } else if (user && PUBLIC_PATHS.includes(pathname)) {
          router.push('/dashboard');
      }
    }
  }, [user, loading, pathname, router]);


  const signIn = async (email: string, password?: string, name?: string) => {
    setLoading(true);

    // Validate email for sign-in
    if (!EMAIL_REGEX.test(email)) {
      toast({
        variant: 'destructive',
        title: t('signin.invalidEmailTitle'),
        description: t('signin.invalidEmailDesc'),
      });
      setLoading(false);
      throw new Error('Invalid email format');
    }

    // Validate password for sign-in (only if password is provided, for sign-in flow)
    if (password && (password !== 'admin' && password !== 'Admin')) {
      toast({
        variant: 'destructive',
        title: t('signin.invalidPasswordTitle'),
        description: t('signin.invalidPasswordDesc'),
      });
      setLoading(false);
      throw new Error('Invalid password');
    }

    const mockUID = 'mock-uid-' + email.replace(/[^a-zA-Z0-9]/g, '');
    const displayNameFromEmail = email.split('@')[0];
    const [firstName, lastName] = displayNameFromEmail.split('.');
    const formattedDisplayName = 
      (firstName ? firstName.charAt(0).toUpperCase() + firstName.slice(1) : '') + 
      (lastName ? ' ' + lastName.charAt(0).toUpperCase() + lastName.slice(1) : '');
      
    const specificMockUser: User = {
      uid: mockUID,
      email: email,
      displayName: name || formattedDisplayName || 'Student',
      photoURL: `https://picsum.photos/seed/${mockUID}/200/200`, 
    };
    
    localStorage.setItem('hbrs-go-user', JSON.stringify(specificMockUser));
    setUser(specificMockUser);
    setLoading(false);
    router.push('/dashboard');
  };

  const signOut = async () => {
    setLoading(true);
    localStorage.removeItem('hbrs-go-user'); 
    setUser(null); 
    setLoading(false);
    router.push('/signin'); 
  };

  const updateProfile = async (payload: UpdateUserPayload) => {
    if (!user) return;
    setLoading(true);
    const updatedUser = { ...user, ...payload };
    localStorage.setItem('hbrs-go-user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    setLoading(false);
  };

  const value = { user, loading, signIn, signOut, updateProfile };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
