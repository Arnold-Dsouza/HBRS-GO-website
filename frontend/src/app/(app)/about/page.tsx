
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, BrainCircuit, LayoutGrid, Palette, Languages, ShieldCheck, Github, Heart } from "lucide-react";
import { useLanguage } from '@/context/LanguageContext';
import { HBRSLogo } from '@/components/icons'; 
import Link from "next/link";
import { Button } from "@/components/ui/button";

const APP_VERSION = "1.0.0"; // Define app version

export default function AboutPage() {
  const { t } = useLanguage();

  const techStack = [
    { name: "Next.js", icon: LayoutGrid, descriptionKey: "about.tech.nextjs" },
    { name: "React", icon: LayoutGrid, descriptionKey: "about.tech.react" },
    { name: "Tailwind CSS", icon: Palette, descriptionKey: "about.tech.tailwind" },
    { name: "Shadcn UI", icon: Palette, descriptionKey: "about.tech.shadcn" },
    { name: "TypeScript", icon: Languages, descriptionKey: "about.tech.typescript" },
    // { name: "Firebase Authentication (Mocked)", icon: ShieldCheck, descriptionKey: "about.tech.firebase" },
    // { name: "Genkit (for future AI features)", icon: BrainCircuit, descriptionKey: "about.tech.genkit" },
  ];

  return (
    <div className="container mx-auto py-8 space-y-8">
      <Card className="shadow-lg overflow-hidden">
        <CardHeader className="bg-primary text-primary-foreground p-8">
          <div className="flex items-center gap-4">
            <HBRSLogo className="h-16 w-16 text-accent" />
            <div>
              <CardTitle className="text-4xl font-bold">{t('appName')}</CardTitle>
              <CardDescription className="text-primary-foreground/80 text-lg">
                {t('about.appSubtitle')}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 md:p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-3 text-primary flex items-center">
              <Info className="mr-2 h-6 w-6" /> {t('about.section.whatIsThis.title')}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('about.section.whatIsThis.content', { appName: t('appName') })}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3 text-primary flex items-center">
              <LayoutGrid className="mr-2 h-6 w-6" /> {t('about.section.keyFeatures.title')}
            </h2>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>{t('about.section.keyFeatures.feature1')}</li>
              <li>{t('about.section.keyFeatures.feature2')}</li>
              <li>{t('about.section.keyFeatures.feature3')}</li>
              <li>{t('about.section.keyFeatures.feature4')}</li>
              <li>{t('about.section.keyFeatures.feature5')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-primary flex items-center">
              <BrainCircuit className="mr-2 h-6 w-6" /> {t('about.section.techStack.title')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {techStack.map((tech) => (
                <Card key={tech.name} className="shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <tech.icon className="mr-2 h-5 w-5 text-accent" /> {tech.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{t(tech.descriptionKey)}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
          
          <section>
             <h2 className="text-2xl font-semibold mb-3 text-primary flex items-center">
              <Github className="mr-2 h-6 w-6" /> {t('about.section.openSource.title')}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              {t('about.section.openSource.content', { appName: t('appName') })}
            </p>
            <Button asChild variant="outline">
              <Link href="https://github.com/your-repo-link" target="_blank" rel="noopener noreferrer">
                <Github className="mr-2 h-4 w-4" /> {t('about.section.openSource.button')}
              </Link>
            </Button>
          </section>

          <div className="text-center text-sm text-muted-foreground pt-6 border-t mt-8">
            <p>{t('appName')} - {t('about.version', { versionNumber: APP_VERSION })}</p>
            <p className="flex items-center justify-center">
                <Heart className="mr-1.5 h-4 w-4 text-red-500" />
                {t('about.madeWithLove', { name: "Arnold Dsouza"})}
            </p>
            <p>&copy; {new Date().getFullYear()} {t('about.copyright')}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
