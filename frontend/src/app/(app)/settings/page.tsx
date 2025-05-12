"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Settings as SettingsIcon, UserCircle, Palette, LogOut, LanguagesIcon, CloudDownload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, type FormEvent } from "react";
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext'; 

const APP_VERSION = "1.0.0"; // Mock app version

export default function SettingsPage() {
  const { user, signOut } = useAuth(); // Removed updateProfile as it's not used
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage(); 
  
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [isCheckingForUpdates, setIsCheckingForUpdates] = useState(false);
  const [showUpToDateDialog, setShowUpToDateDialog] = useState(false);

  useEffect(() => {
    if (user?.displayName) {
      setDisplayName(user.displayName);
    }
  }, [user?.displayName]);

  // Profile update functionality is removed/disabled as per request.
  // const handleProfileUpdate = async (e: FormEvent) => {
  //   e.preventDefault();
  //   if (!displayName.trim()) {
  //       toast({
  //           title: t('settings.profile.validationError'),
  //           variant: "destructive",
  //       });
  //       return;
  //   }
  //   if (updateProfile) {
  //       try {
  //           await updateProfile({ displayName });
  //           toast({
  //               title: t('settings.profile.updateSuccess'),
  //               description: t('settings.profile.updateSuccessDesc'),
  //           });
  //       } catch (error) {
  //           toast({
  //               title: t('settings.profile.updateFailed'),
  //               description: t('settings.profile.updateFailedDesc'),
  //               variant: "destructive",
  //           });
  //           console.error("Profile update error:", error);
  //       }
  //   }
  // };

  const handleThemeChange = (checked: boolean) => {
    const newTheme = checked ? 'dark' : 'light';
    setTheme(newTheme);
    toast({
      title: t('settings.appearance.themeChanged'),
      description: newTheme === 'dark' ? t('settings.appearance.themeChangedDescDark') : t('settings.appearance.themeChangedDescLight'),
    });
  };
  
  const handleLanguageChange = (value: string) => {
    const newLang = value as 'en' | 'de';
    setLanguage(newLang); 
    toast({
      title: t('settings.language.languageChanged'),
      description: t('settings.language.languageChangedDesc', { language: newLang === "en" ? t('settings.language.english') : t('settings.language.german') }),
    });
  };

  const handleCheckForUpdates = () => {
    setIsCheckingForUpdates(true);
    setShowUpToDateDialog(false); 
    toast({
      title: t('settings.appUpdates.checkingToastTitle'),
      description: t('settings.appUpdates.checkingToastDesc'),
    });
    
    setTimeout(() => {
      setIsCheckingForUpdates(false);
      setShowUpToDateDialog(true);
    }, 2000);
  };


  return (
    <div className="container mx-auto py-8 space-y-8">
        <Card className="shadow-lg">
            <CardHeader>
            <CardTitle className="text-3xl font-bold flex items-center">
                <SettingsIcon className="mr-3 h-8 w-8 text-primary" /> {t('settings.title')}
            </CardTitle>
            <CardDescription>{t('settings.description')}</CardDescription>
            </CardHeader>
        </Card>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {/* Profile Settings */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center"><UserCircle className="mr-2 text-primary" /> {t('settings.profile.title')}</CardTitle>
            <CardDescription>{t('settings.profile.descriptionReadOnly')}</CardDescription> 
          </CardHeader>
          {/* Removed form onSubmit handler */}
          <form> 
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="displayName">{t('settings.profile.displayName')}</Label>
                <Input 
                  id="displayName" 
                  value={displayName}
                  // onChange={(e) => setDisplayName(e.target.value)} // Removed onChange
                  placeholder={t('settings.profile.displayNamePlaceholder')}
                  disabled // Disabled the input field
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="email">{t('settings.profile.email')}</Label>
                <Input id="email" type="email" value={user?.email || ""} disabled />
              </div>
            </CardContent>
            <CardFooter>
                {/* Disabled the button and changed text */}
                <Button type="button" className="w-full" disabled> 
                  {t('settings.profile.viewButton')}
                </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Appearance Settings */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center"><Palette className="mr-2 text-primary" /> {t('settings.appearance.title')}</CardTitle>
            <CardDescription>{t('settings.appearance.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <Label htmlFor="dark-mode" className="text-base">{t('settings.appearance.darkMode')}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('settings.appearance.darkModeDesc')}
                </p>
              </div>
              <Switch
                id="dark-mode"
                checked={theme === 'dark'}
                onCheckedChange={handleThemeChange}
                aria-label={t('settings.appearance.darkMode')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Language Settings */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center"><LanguagesIcon className="mr-2 text-primary" /> {t('settings.language.title')}</CardTitle>
            <CardDescription>{t('settings.language.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="space-y-1">
                <Label htmlFor="language-select">{t('settings.language.selectLabel')}</Label>
                <Select value={language} onValueChange={handleLanguageChange}>
                    <SelectTrigger id="language-select">
                    <SelectValue placeholder={t('settings.language.selectLabel')} />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="en">{t('settings.language.english')}</SelectItem>
                    <SelectItem value="de">{t('settings.language.german')}</SelectItem>
                    </SelectContent>
                </Select>
            </div>
          </CardContent>
        </Card>

        {/* App Updates Settings */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center"><CloudDownload className="mr-2 text-primary" /> {t('settings.appUpdates.title')}</CardTitle>
            <CardDescription>{t('settings.appUpdates.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t('settings.appUpdates.currentVersion', { version: APP_VERSION })}
            </p>
            <Button onClick={handleCheckForUpdates} className="w-full" disabled={isCheckingForUpdates}>
              {isCheckingForUpdates ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CloudDownload className="mr-2 h-4 w-4" />
              )}
              {isCheckingForUpdates ? t('settings.appUpdates.checkingButton') : t('settings.appUpdates.checkButton')}
            </Button>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card className="shadow-md md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center"><LogOut className="mr-2 text-destructive" /> {t('settings.accountActions.title')}</CardTitle>
            <CardDescription>{t('settings.accountActions.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={signOut} className="w-full sm:w-auto">
              {t('settings.accountActions.signOutButton')}
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
                {t('settings.accountActions.signOutDesc')}
            </p>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showUpToDateDialog} onOpenChange={setShowUpToDateDialog}>
        <DialogContent className="sm:max-w-md overflow-hidden p-0 border-0">
          <div className="flex flex-col items-center">
            <div className="w-full">
              <Image
                src="/images/cat.gif" 
                alt={t('settings.appUpdates.upToDateToastTitle')}
                width={300}
                height={230}
                className="w-full h-auto"
                priority
                unoptimized
              />
            </div>
            <div className="w-full px-6 py-4 bg-card">
              <DialogHeader className="pb-2">
                <DialogTitle className="text-center text-xl">{t('settings.appUpdates.upToDateToastTitle')}</DialogTitle>
              </DialogHeader>
              <p className="text-center text-muted-foreground mb-4">
                {t('settings.appUpdates.upToDateToastDesc', { version: APP_VERSION })}
              </p>
              <DialogFooter className="sm:justify-center pt-2">
                <Button type="button" onClick={() => setShowUpToDateDialog(false)}>
                  {t('settings.appUpdates.closeDialogButton')}
                </Button>
              </DialogFooter>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

