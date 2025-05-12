"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useLanguage } from '@/context/LanguageContext'; // Added

const TIMETABLE_URL = "https://eva2.inf.h-brs.de/stundenplan/";

export default function TimetablePage() {
  const { t } = useLanguage(); // Added
  return (
    <div className="flex flex-col flex-1 gap-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold flex items-center">
            <CalendarDays className="mr-3 h-8 w-8 text-primary" /> {t('timetable.pageTitle')}
          </CardTitle>
          <CardDescription>
            {t('timetable.pageDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline">
            <Link href={TIMETABLE_URL} target="_blank" rel="noopener noreferrer">
              {t('timetable.openTimetableButton')} <ExternalLink className="ml-2 h-4 w-4" />
            </Link>
          </Button>
           <p className="text-sm text-muted-foreground mt-2">
            {t('timetable.externalNote')}
          </p>
        </CardContent>
      </Card>

      <Card className="flex-1 shadow-lg overflow-hidden">
        <CardContent className="p-6 h-full flex flex-col items-center justify-center">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-4">{t('timetable.underConstruction')}</h3>
            <div className="relative w-full max-w-md h-64 mx-auto mb-4">
              <img 
                src="/images/construction.gif"
                alt={t('timetable.constructionAlt')}
                className="object-contain h-full w-full"
              />
            </div>
            <p className="text-muted-foreground">
              {t('timetable.comingSoon')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
