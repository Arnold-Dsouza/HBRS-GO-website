
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
// import type { User } from 'firebase/auth'; // No longer needed due to AuthContext changes
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext'; // Added


export default function HomePage() {
  const { loading, user } = useAuth(); 
  const router = useRouter();
  const { t } = useLanguage(); // Added

  useEffect(() => {
    if (!loading) {
      if (user) { // Check if user exists (mock user will always exist in current setup)
        router.replace('/dashboard');
      } else {
        // This case might not be hit with the current mock auth setup,
        // but good to have if auth logic changes to allow no initial user.
        router.replace('/signin'); // Or your preferred sign-in page
      }
    }
  }, [loading, user, router]);

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="ml-4 text-lg">{t('loadingApp')}</p>
    </div>
  );
}
