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
  const [isLoading, setIsLoading] = useState(false);

  const { signIn } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleSignUp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!EMAIL_REGEX_SIGNUP.test(email)) {
      toast({
        variant: 'destructive',
        title: t('signin.invalidEmailTitle'),
        description: t('signin.invalidEmailDesc'),
      });
      return;
    }

    setIsLoading(true);

    try {
      await signIn(email, undefined, name);
      // Removed welcome/redirecting notification
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: t('signup.errorTitle'),
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
