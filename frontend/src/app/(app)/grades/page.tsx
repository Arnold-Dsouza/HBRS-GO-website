"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useLanguage } from '@/context/LanguageContext'; // Added

const GRADES_URL = "https://apollo.h-brs.de/"; // Apollo is used for exam registration and likely grades

export default function GradesPage() {
  const { t } = useLanguage(); // Added
  return (
    <div className="flex flex-col flex-1 gap-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold flex items-center">
            <GraduationCap className="mr-3 h-8 w-8 text-primary" /> {t('grades.pageTitle')}
          </CardTitle>
          <CardDescription>
            {t('grades.pageDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline">
            <Link href={GRADES_URL} target="_blank" rel="noopener noreferrer">
              {t('grades.openApolloButton')} <ExternalLink className="ml-2 h-4 w-4" />
            </Link>
          </Button>
           <p className="text-sm text-muted-foreground mt-2">
            {t('grades.externalNote')}
          </p>
        </CardContent>
      </Card>

      <Card className="flex-1 shadow-lg overflow-hidden">
        <CardContent className="p-6 h-full flex flex-col items-center justify-center">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-4">{t('grades.underConstruction')}</h3>
            <div className="relative w-full max-w-md h-64 mx-auto mb-4">
              <img 
                src="/images/construction.gif"
                alt={t('grades.constructionAlt')}
                className="object-contain h-full w-full"
              />
            </div>
            <p className="text-muted-foreground">
              {t('grades.comingSoon')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
