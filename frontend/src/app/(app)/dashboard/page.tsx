"use client";
import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  Library,
  Mail,
  CalendarDays,
  Users,
  Utensils,
  Briefcase,
  ExternalLink,
  ArrowRight,
  Link2, // Added for generic link icon
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext'; 

interface QuickLink {
  titleKey: string; 
  descriptionKey: string; 
  href: string;
  icon: LucideIcon;
  isExternal?: boolean;
  imgSrc?: string;
  imgAlt?: string;
  dataAiHint?: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { t } = useLanguage(); 
  const router = useRouter();

  const mainLinks: QuickLink[] = [
    {
      titleKey: 'dashboard.timetableTitle',
      descriptionKey: 'dashboard.timetableDesc',
      href: '/timetable',
      icon: CalendarDays,
      imgSrc: '/images/robot-calendar.jpg',
      imgAlt: 'Robot managing a calendar schedule',
      dataAiHint: 'schedule calendar'
    },
    {
      titleKey: 'dashboard.gradesTitle',
      descriptionKey: 'dashboard.gradesDesc',
      href: '/grades',
      icon: GraduationCap,
      imgSrc: '/images/robot-graduation.jpg',
      imgAlt: 'Robot with graduation cap',
      dataAiHint: 'grades report'
    },
    {
      titleKey: 'dashboard.libraryTitle',
      descriptionKey: 'dashboard.libraryDesc',
      href: '/library',
      icon: Library,
      imgSrc: '/images/robot-library.jpg',
      imgAlt: 'Robot reading books in library',
      dataAiHint: 'library books'
    },
    {
      titleKey: 'dashboard.cafeteriaMenuTitle',
      descriptionKey: 'dashboard.cafeteriaMenuDesc',
      href: '/menu',
      icon: Utensils,
      imgSrc: '/images/robot-food.jpg',
      imgAlt: 'Robot chef preparing food',
      dataAiHint: 'cafeteria food'
    },
  ];
  
  const externalToolLinks: QuickLink[] = [
    {
      titleKey: 'dashboard.extLinkLeaTitle',
      descriptionKey: 'dashboard.extLinkLeaDesc',
      href: 'https://lea.hochschule-bonn-rhein-sieg.de/',
      icon: Briefcase,
      isExternal: true,
      imgSrc: '/images/robot-learning.jpg',
      imgAlt: 'Robot using a laptop for e-learning',
      dataAiHint: 'elearning platform'
    },
    {
      titleKey: 'dashboard.extLinkSisTitle',
      descriptionKey: 'dashboard.extLinkSisDesc',
      href: 'https://sis.h-brs.de/',
      icon: Briefcase, 
      isExternal: true,
      imgSrc: '/images/robot-data.jpg',
      imgAlt: 'Robot accessing student information system',
      dataAiHint: 'student system'
    },
    {
      titleKey: 'dashboard.extLinkMiaTitle',
      descriptionKey: 'dashboard.extLinkMiaDesc',
      href: 'https://mia.h-brs.de/',
      icon: Briefcase,
      isExternal: true,
      imgSrc: '/images/robot-portal.jpg',
      imgAlt: 'Robot accessing MIA portal',
      dataAiHint: 'information portal'
    },
    {
      titleKey: 'dashboard.extLinkApolloTitle',
      descriptionKey: 'dashboard.extLinkApolloDesc',
      href: 'https://apollo.h-brs.de/',
      icon: Briefcase,
      isExternal: true,
      imgSrc: '/images/robot-exam.jpg',
      imgAlt: 'Robot registering for exam',
      dataAiHint: 'exam registration'
    },
    {
      titleKey: 'dashboard.extLinkScieboTitle',
      descriptionKey: 'dashboard.extLinkScieboDesc',
      href: 'https://www.sciebo.de/',
      icon: Briefcase,
      isExternal: true,
      imgSrc: '/images/robot-cloud.jpg',
      imgAlt: 'Robot using cloud storage',
      dataAiHint: 'cloud storage'
    },
    {
      titleKey: 'dashboard.extLinkBibDiscoverTitle',
      descriptionKey: 'dashboard.extLinkBibDiscoverDesc',
      href: 'https://bib-discover.bib.h-brs.de/',
      icon: Library,
      isExternal: true,
      imgSrc: '/images/robot-search.jpg',
      imgAlt: 'Robot searching library database',
      dataAiHint: 'library search'
    },
  ];

  const displayName = user?.displayName || user?.email?.split('@')[0] || t('dashboard.defaultStudentName');
  
  // Handler for navigation that supports the collapsing sidebar
  const handleNavigation = (href: string) => {
    if (href.startsWith('http')) {
      window.open(href, '_blank', 'noopener,noreferrer');
    } else {
      router.push(href);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">
            {t('dashboard.welcome', { name: displayName })}
          </CardTitle>
          <CardDescription>{t('dashboard.description')}</CardDescription>
        </CardHeader>
      </Card>

      <section>
        <h2 className="text-2xl font-semibold mb-4 text-foreground">{t('dashboard.quickAccess')}</h2>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {mainLinks.map((link) => (
            <QuickLinkCard key={link.titleKey} {...link} t={t} onNavigate={handleNavigation} />
          ))}
        </div>
      </section>
      
      <section>
        <h2 className="text-2xl font-semibold mb-4 text-foreground">{t('dashboard.eLearningTools')}</h2>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {externalToolLinks.map((link) => (
            <QuickLinkCard key={link.titleKey} {...link} t={t} onNavigate={handleNavigation} />
          ))}
        </div>
      </section>
    </div>
  );
}

interface QuickLinkCardProps extends QuickLink {
  t: (key: string, params?: Record<string, string | number>) => string;
  onNavigate: (href: string) => void;
}

function QuickLinkCard({ 
  titleKey, 
  descriptionKey, 
  href, 
  icon: Icon, 
  isExternal, 
  imgSrc, 
  imgAlt, 
  dataAiHint, 
  t,
  onNavigate 
}: QuickLinkCardProps) {
  const translatedTitle = t(titleKey); 
  const translatedDescription = t(descriptionKey); 
  
  // Use a robot placeholder if the image doesn't exist
  const imagePath = imgSrc || '/images/cat.gif';

  return (
    <Card 
      className="h-full flex flex-col shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden group cursor-pointer" 
      onClick={() => onNavigate(href)}
      tabIndex={0}
      role="button"
      aria-label={isExternal ? t('dashboard.openExternal', { title: translatedTitle }) : t('dashboard.goTo', { title: translatedTitle })}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onNavigate(href);
        }
      }}
    >
      {imgSrc && (
         <div className="relative w-full h-40 overflow-hidden bg-muted flex items-center justify-center">
            <Image 
                src={imagePath} 
                alt={imgAlt || translatedTitle} 
                fill={true}
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                style={{objectFit: "contain"}} // Changed to contain for better GIF display
                className="group-hover:scale-105 transition-transform duration-300"
                data-ai-hint={dataAiHint}
                unoptimized={true} // Better for GIFs to prevent optimization that breaks animation
                priority={false}
            />
         </div>
      )}
      <CardHeader className="flex-grow">
        <div className="flex items-center mb-2">
          <Icon className="h-6 w-6 mr-3 text-primary flex-shrink-0" />
          <CardTitle className="text-xl group-hover:text-accent transition-colors duration-300">{translatedTitle}</CardTitle>
        </div>
        <CardDescription>{translatedDescription}</CardDescription>
      </CardHeader>
      <CardContent className="mt-auto">
        <Button variant="outline" className="w-full group-hover:bg-accent group-hover:text-accent-foreground transition-colors duration-300">
          {isExternal ? t('dashboard.openExternal', { title: translatedTitle }) : t('dashboard.goTo', { title: translatedTitle })}
          {isExternal ? <ExternalLink className="ml-2 h-4 w-4 flex-shrink-0" /> : <ArrowRight className="ml-2 h-4 w-4 flex-shrink-0" />}
        </Button>
      </CardContent>
    </Card>
  );
}
