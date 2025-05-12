
"use client";

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { User, Mail, Lock, Loader2 } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { HBRSLogo } from '@/components/icons';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/LanguageContext';

const EMAIL_REGEX_SIGNUP = /^[a-zA-Z0-9_.-]+?\.[a-zA-Z0-9_.-]+?@smail\.inf\.h-brs\.de$/;


export default function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // Error state is now handled by toasts from AuthContext or local validation toasts

  const { signIn } = useAuth(); // Using signIn for mock, which can take name
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleSignUp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: t('signup.passwordMismatch'),
      });
      return;
    }
    if (!EMAIL_REGEX_SIGNUP.test(email)) {
      toast({
        variant: 'destructive',
        title: t('signin.invalidEmailTitle'), // Re-use for consistency
        description: t('signin.invalidEmailDesc'),
      });
      return;
    }

    setIsLoading(true);

    try {
      // Using signIn for mock as it accepts an optional name for displayName.
      // Password is not passed here as per the prompt focusing on sign-in validation.
      // If sign-up should also validate/use password, signIn in AuthContext needs adjustment.
      await signIn(email, undefined, name); 
      toast({
        title: t('signup.successTitle'),
        description: t('signup.successDesc'),
      });
      // AuthContext will redirect to dashboard
    } catch (err: any) {
       // Specific errors like invalid email format might be caught by signIn if we enhance it
       // For now, local validation handles it. Generic errors from signIn:
       toast({
        variant: "destructive",
        title: t('signup.errorTitle'), // Adding a signup specific error title
        description: err.message || t('signup.genericError'),
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="items-center text-center">
          <HBRSLogo className="h-20 w-20 mb-4 text-primary" />
          <CardTitle className="text-3xl font-bold">{t('appName')}</CardTitle>
          <CardDescription>{t('signup.subtitle')}</CardDescription>
        </CardHeader>
        <form onSubmit={handleSignUp}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">{t('signup.nameLabel')}</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder={t('signup.namePlaceholder')}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t('signup.emailLabel')}</Label>
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
              <Label htmlFor="password">{t('signup.passwordLabel')}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10"
                  placeholder="********"
                />
              </div>
            </div>
             <div className="space-y-2">
              <Label htmlFor="confirm-password">{t('signup.confirmPasswordLabel')}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="pl-10"
                  placeholder="********"
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
                  {t('signup.signingUpButton')}
                </>
              ) : (
                t('signup.signUpButton')
              )}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              {t('signup.hasAccount')}{' '}
              <Link href="/signin" className="font-medium text-primary hover:underline">
                {t('signup.signInLink')}
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
