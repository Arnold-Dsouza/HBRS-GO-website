"use client";

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Loader2 } from 'lucide-react';
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { HBRSLogo } from '@/components/icons';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/LanguageContext';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); 
  const [isLoading, setIsLoading] = useState(false);
  // Error state is now handled by toasts from AuthContext

  const { signIn } = useAuth();
  const router = useRouter(); // router might not be needed if AuthContext handles all navigation
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      await signIn(email, password); 
      // Successful sign-in will redirect via AuthContext effect
      // Toast for success is better handled in AuthContext or upon redirection to dashboard
      // to avoid toast appearing then immediately disappearing on navigation.
      // For this exercise, we'll keep a local toast for explicit feedback here.
      toast({
        title: t('signin.successTitle'),
        description: t('signin.successDesc'),
      });
    } catch (err: any) {
      // Specific errors are toasted by AuthContext. 
      // A generic fallback can be here if needed, but AuthContext should cover it.
      // If err.message is one of the specific messages from AuthContext, it's already handled.
      // Otherwise, show a generic one.
      if (err.message !== 'Invalid email format' && err.message !== 'Invalid password') {
        toast({
          variant: 'destructive',
          title: t('signin.errorTitle'),
          description: t('signin.genericError'),
        });
      }
      setIsLoading(false);
    }
    // setLoading(false) is handled by AuthContext redirect or error above
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="items-center text-center">
          <Image 
            src="/images/hbrs.png"
            alt="HBRS Logo"
            width={1280}
            height={230}
            className="h-10 w-auto mb-4"
            priority
          />
          <CardTitle className="text-3xl font-bold">{t('appName')}</CardTitle>
          <CardDescription>{t('signin.subtitle')}</CardDescription>
        </CardHeader>
        <form onSubmit={handleSignIn}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">{t('signin.emailLabel')}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name.surname@smail.inf.h-brs.de"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t('signin.passwordLabel')}</Label>
                {/* <Link href="#" className="text-sm text-primary hover:underline">
                  {t('signin.forgotPassword')}
                </Link> */}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10"
                  placeholder="Password" 
                />
              </div>
            </div>
            {/* Removed local error display, relying on toasts */}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {t('signin.signingInButton')}
                </>
              ) : (
                t('signin.signInButton')
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
