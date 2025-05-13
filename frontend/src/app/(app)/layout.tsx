"use client";
import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  Library,
  Mail,
  CalendarDays,
  Settings,
  LogOut,
  ChevronDown,
  Menu as MenuIconLucide,
  Users,
  Utensils,
  Briefcase,
  ExternalLink,
  Ticket, 
  Link2, 
  Info, // Added for About page
  CreditCard, // Added for Card Recharge
  Moon,
  Sun,
  Languages,
  Gamepad,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { HBRSLogo } from '@/components/icons';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext'; 
import { useTheme } from '@/context/ThemeContext';
import Image from "next/image";

export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut, loading } = useAuth();
  const { t, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [isClient, setIsClient] = useState(false);
  const [openMobile, setOpenMobile] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  const navItems = [
    { href: '/dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard },
    { href: '/menu', labelKey: 'nav.menu', icon: Utensils },
    { href: '/deutschland-semesterticket', labelKey: 'nav.semesterticket', icon: Ticket }, 
    { href: '/card-recharge', labelKey: 'nav.cardRecharge', icon: CreditCard },
    { href: '/timetable', labelKey: 'nav.timetable', icon: CalendarDays },
    { href: '/grades', labelKey: 'nav.grades', icon: GraduationCap },
    { href: '/library', labelKey: 'nav.library', icon: Library },
    { href: '/services', labelKey: 'nav.services', icon: Users },
    { href: '/game', labelKey: 'nav.game', icon: Gamepad },
    { href: '/about', labelKey: 'nav.about', icon: Info }, // Added About page
    { href: '/settings', labelKey: 'nav.settings', icon: Settings },
  ];
  
  const externalLinks = [
      { href: "https://lea.hochschule-bonn-rhein-sieg.de/", labelKey: "dashboard.extLinkLeaTitle", icon: Briefcase },
      { href: "https://sis.h-brs.de/", labelKey: "dashboard.extLinkSisTitle", icon: Briefcase },
      { href: "https://mia.h-brs.de/", labelKey: "dashboard.extLinkMiaTitle", icon: Briefcase },
      { href: "https://apollo.h-brs.de/", labelKey: "dashboard.extLinkApolloTitle", icon: Briefcase },
      { href: "https://www.sciebo.de/", labelKey: "dashboard.extLinkScieboTitle", icon: Briefcase },
      { href: "https://bib-discover.bib.h-brs.de/", labelKey: "dashboard.extLinkBibDiscoverTitle", icon: Library },
  ];


  if (!isClient || loading) {
    return <LoadingScreen t={t} />;
  }
  
  if (!user) {
    return <LoadingScreen t={t} />; // Or redirect, AuthProvider should handle this
  }

  const userInitial = user?.displayName ? user.displayName.charAt(0).toUpperCase() : (user?.email ? user.email.charAt(0).toUpperCase() : 'S');
  
  // Handler for navigation that collapses mobile sidebar
  const handleNavigation = (href: string) => {
    // Close the mobile sidebar when a navigation item is clicked
    setOpenMobile(false);
    // Navigate to the page
    router.push(href);
  };

  const SidebarContentNav = () => (
    <nav className="flex flex-col gap-1 px-2">
    {navItems.map((item) => (
      <Button
        key={item.labelKey}
        variant={pathname === item.href ? 'secondary' : 'ghost'}
        className="justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground"
        onClick={() => handleNavigation(item.href)}
        data-active={pathname === item.href}
      >
        <item.icon className="mr-2 h-5 w-5" />
        {t(item.labelKey)}
      </Button>
    ))}
    <DropdownMenuSeparator className="my-2 bg-sidebar-border" />
    <p className="px-2 py-1 text-sm font-medium text-sidebar-foreground/70">{t('nav.externalLinks')}</p>
     {externalLinks.map((item) => (
        <Button
            key={item.labelKey}
            variant='ghost'
            className="justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            onClick={() => {
              setOpenMobile(false);
              window.open(item.href, '_blank', 'noopener,noreferrer');
            }}
        >
            <item.icon className="mr-2 h-5 w-5" />
            {t(item.labelKey)}
            <ExternalLink className="ml-auto h-4 w-4" />
        </Button>
        ))}
  </nav>
  );


  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-sidebar md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b border-sidebar-border px-4 lg:h-[60px] lg:px-6">
            <Button 
              variant="ghost" 
              className="flex items-center gap-2 font-semibold text-sidebar-foreground p-0"
              onClick={() => handleNavigation('/dashboard')}
            >
              <div className="bg-white p-1 rounded">
                <Image 
                  src="/images/hbrs.png"
                  alt="HBRS Logo"
                  width={1280}
                  height={230}
                  className="h-10 w-auto"
                  priority
                />
              </div>
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto">
           <SidebarContentNav />
          </div>
          <div className="mt-auto p-4 border-t border-sidebar-border">
            <Button variant="ghost" className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" onClick={signOut}>
              <LogOut className="mr-2 h-5 w-5" />
              {t('nav.signOut')}
            </Button>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
          <Sheet open={openMobile} onOpenChange={setOpenMobile}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <MenuIconLucide className="h-5 w-5" />
                <span className="sr-only">{t('userMenu.toggle')}</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col bg-sidebar p-0 text-sidebar-foreground">
            <div className="flex h-14 items-center border-b border-sidebar-border px-4 lg:h-[60px] lg:px-6">
                <Button 
                  variant="ghost" 
                  className="flex items-center gap-2 font-semibold text-sidebar-foreground p-0"
                  onClick={() => handleNavigation('/dashboard')}
                >
                  <div className="bg-white p-1 rounded">
                    <Image 
                      src="/images/hbrs.png"
                      alt="HBRS Logo"
                      width={1280}
                      height={230}
                      className="h-8 w-auto"
                      priority
                    />
                  </div>
                  <span className="">{t('appName')}</span>
                </Button>
            </div>
             <div className="flex-1 overflow-y-auto py-2">
                <SidebarContentNav />
              </div>
              <div className="mt-auto p-4 border-t border-sidebar-border">
                <Button variant="ghost" className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" onClick={signOut}>
                  <LogOut className="mr-2 h-5 w-5" />
                  {t('nav.signOut')}
                </Button>
              </div>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            {/* Optional: Add search or other header elements here */}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2">
                <Languages className="h-5 w-5" />
                <span className="sr-only">{t('settings.language.title')}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setLanguage('en')}>
                English
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage('de')}>
                Deutsch
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="mr-2"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">{t('settings.appearance.darkMode')}</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <Avatar>
                  <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || 'User Avatar'} />
                  <AvatarFallback>{userInitial}</AvatarFallback>
                </Avatar>
                <span className="sr-only">{t('userMenu.toggle')}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{user?.displayName || user?.email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleNavigation('/settings')}>
                {t('userMenu.settings')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut}>{t('userMenu.logout')}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

function LoadingScreen({ t }: {t : (key: string, params?: Record<string, string | number>) => string}) { 
  const navItems = [ 
    { href: '/dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard },
    { href: '/menu', labelKey: 'nav.menu', icon: Utensils },
    { href: '/deutschland-semesterticket', labelKey: 'nav.semesterticket', icon: Ticket }, 
    { href: '/card-recharge', labelKey: 'nav.cardRecharge', icon: CreditCard },
    { href: '/timetable', labelKey: 'nav.timetable', icon: CalendarDays },
    { href: '/grades', labelKey: 'nav.grades', icon: GraduationCap },
    { href: '/library', labelKey: 'nav.library', icon: Library },
    { href: '/services', labelKey: 'nav.services', icon: Users },
    { href: '/about', labelKey: 'nav.about', icon: Info }, // Added About page
    { href: '/settings', labelKey: 'nav.settings', icon: Settings },
  ];
  const externalLinks = [ 
      { href: "https://lea.hochschule-bonn-rhein-sieg.de/", labelKey: "dashboard.extLinkLeaTitle", icon: Briefcase },
      { href: "https://sis.h-brs.de/", labelKey: "dashboard.extLinkSisTitle", icon: Briefcase },
      { href: "https://mia.h-brs.de/", labelKey: "dashboard.extLinkMiaTitle", icon: Briefcase },
      { href: "https://apollo.h-brs.de/", labelKey: "dashboard.extLinkApolloTitle", icon: Briefcase },
      { href: "https://www.sciebo.de/", labelKey: "dashboard.extLinkScieboTitle", icon: Briefcase },
      { href: "https://bib-discover.bib.h-brs.de/", labelKey: "dashboard.extLinkBibDiscoverTitle", icon: Library },
  ];

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
       <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-sidebar md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b border-sidebar-border px-4 lg:h-[60px] lg:px-6">
             <Link href="/" className="flex items-center gap-2 font-semibold text-sidebar-foreground">
                <HBRSLogo className="h-8 w-8" />
                <span className="">{t('loadingScreen.sidebar.appName')}</span>
             </Link>
          </div>
          <div className="flex-1 overflow-y-auto">
             <nav className="grid items-start px-2 text-sm font-medium lg:px-4 py-4">
                {[...Array(navItems.length + externalLinks.length +1)].map((_, i) => ( 
                  <Skeleton key={i} className="h-10 w-full mb-2 bg-sidebar-accent/30" />
                ))}
              </nav>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
          <div className="w-full flex-1">
             <Skeleton className="h-8 w-32 bg-muted" />
          </div>
          <Skeleton className="h-10 w-10 rounded-full bg-muted" />
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
            <Skeleton className="h-12 w-1/2 bg-muted" />
            <Skeleton className="h-32 w-full bg-muted" />
            <Skeleton className="h-32 w-full bg-muted" />
        </main>
      </div>
    </div>
    </div>
  );
}

