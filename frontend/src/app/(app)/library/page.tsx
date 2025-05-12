"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Library as LibraryIcon, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useLanguage } from '@/context/LanguageContext'; // Added

const BIB_DISCOVER_URL = "https://bib-discover.bib.h-brs.de/";

export default function LibraryPage() {
  const { t } = useLanguage(); // Added
  return (
    <div className="flex flex-col flex-1 gap-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold flex items-center">
            <LibraryIcon className="mr-3 h-8 w-8 text-primary" /> {t('library.pageTitle')}
          </CardTitle>
          <CardDescription>
            {t('library.pageDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline">
            <Link href={BIB_DISCOVER_URL} target="_blank" rel="noopener noreferrer">
              {t('library.openBibDiscoverButton')} <ExternalLink className="ml-2 h-4 w-4" />
            </Link>
          </Button>
           <p className="text-sm text-muted-foreground mt-2">
            {t('library.externalNote')}
          </p>
        </CardContent>
      </Card>

      <Card className="flex-1 shadow-lg overflow-hidden">
        <CardContent className="p-6 h-full flex flex-col items-center justify-center">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-4">{t('library.underConstruction')}</h3>
            <div className="relative w-full max-w-md h-64 mx-auto mb-4">
              <img 
                src="/images/construction.gif"
                alt={t('library.constructionAlt')}
                className="object-contain h-full w-full"
              />
            </div>
            <p className="text-muted-foreground">
              {t('library.comingSoon')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
