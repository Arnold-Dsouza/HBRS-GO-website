
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Ticket, UploadCloud, FileText, Loader2, X, Image as ImageIcon, FileWarning, IdCard, CalendarClock, UserCheck, Info, Library, Hash } from "lucide-react";
import Image from 'next/image';
import { useState, type ChangeEvent, useRef, useEffect } from "react";
import * as pdfjsLib from 'pdfjs-dist';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext'; 


export default function DeutschlandSemesterticketPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false); 
  const [ticketImageDataUrl, setTicketImageDataUrl] = useState<string | null>(null);
  const [pdfFallbackUrl, setPdfFallbackUrl] = useState<string | null>(null); 
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const { user } = useAuth();
  const [expiryYear, setExpiryYear] = useState<number | null>(null);
  const { t } = useLanguage(); 

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
    }
    // Attempt to load image or PDF from localStorage on component mount
    const storedImage = localStorage.getItem('deutschlandTicketImage');
    const storedPdf = localStorage.getItem('deutschlandTicketPdf'); 
    if (storedImage) {
      setTicketImageDataUrl(storedImage);
    } else if (storedPdf) {
      setPdfFallbackUrl(storedPdf); 
    }
    setExpiryYear(new Date().getFullYear() + 4); // Mock expiry year
  }, []);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.type === "application/pdf") {
        if (file.size > 10 * 1024 * 1024) { 
            toast({
                variant: "destructive",
                title: t('semesterticket.fileTooLargeTitle'),
                description: t('semesterticket.fileTooLargeDesc'),
            });
            setSelectedFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = ""; 
            }
            return;
        }
        setSelectedFile(file);
        setTicketImageDataUrl(null); 
        setPdfFallbackUrl(null);
      } else {
        toast({
          variant: "destructive",
          title: t('semesterticket.invalidFileTypeTitle'),
          description: t('semesterticket.invalidFileTypeDesc'),
        });
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = ""; 
        }
      }
    } else {
      setSelectedFile(null);
    }
  };

  const convertPdfToImage = async (file: File): Promise<string | null> => {
    if (!isClient) return null; // Ensure this only runs on the client
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const page = await pdf.getPage(1); 

      const viewport = page.getViewport({ scale: 1.5 }); 
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) throw new Error("Could not get canvas context");

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({ canvasContext: context, viewport: viewport }).promise;
      return canvas.toDataURL('image/jpeg', 0.8); 
    } catch (error) {
      console.error("Error converting PDF to image:", error);
      toast({
        variant: "destructive",
        title: t('semesterticket.conversionErrorTitle'),
        description: t('semesterticket.conversionErrorDesc'),
      });
      return null;
    }
  };


  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        variant: "destructive",
        title: t('semesterticket.noFileSelectedTitle'),
        description: t('semesterticket.noFileSelectedDesc'),
      });
      return;
    }

    setProcessing(true);
    
    const imageDataUrl = await convertPdfToImage(selectedFile);

    if (imageDataUrl) {
      setTicketImageDataUrl(imageDataUrl);
      try {
        localStorage.setItem('deutschlandTicketImage', imageDataUrl);
        localStorage.removeItem('deutschlandTicketPdf'); 
      } catch (error) {
        console.error("Error saving image to localStorage:", error);
        toast({
          variant: "destructive",
          title: t('semesterticket.storageErrorTitle'),
          description: t('semesterticket.storageErrorDescImage'),
        });
      }
      toast({
        title: t('semesterticket.ticketImageReadyTitle'),
        description: t('semesterticket.ticketImageReadyDesc', { fileName: selectedFile.name }),
      });
    } else {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPdfFallbackUrl(result);
        try {
          localStorage.setItem('deutschlandTicketPdf', result);
          localStorage.removeItem('deutschlandTicketImage'); 
        } catch (error) {
          console.error("Error saving PDF to localStorage:", error);
           toast({
            variant: "destructive",
            title: t('semesterticket.storageErrorTitle'),
            description: t('semesterticket.storageErrorDescPdf'),
          });
        }
        toast({
          title: t('semesterticket.ticketPdfReadyTitle'),
          description: t('semesterticket.ticketPdfReadyDesc', { fileName: selectedFile.name }),
        });
      };
      reader.onerror = () => {
          toast({
              variant: "destructive",
              title: t('semesterticket.fileReadErrorTitle'),
              description: t('semesterticket.fileReadErrorDesc'),
          });
      };
      reader.readAsDataURL(selectedFile);
    }
    setProcessing(false);
  };

  const handleReupload = () => {
    setTicketImageDataUrl(null);
    setPdfFallbackUrl(null);
    setSelectedFile(null);
    localStorage.removeItem('deutschlandTicketImage');
    localStorage.removeItem('deutschlandTicketPdf');
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const studentName = user?.displayName || user?.email?.split('@')[0] || t('semesterticket.defaultStudentName'); // Use translation for default
  const studentId = user?.uid ? `SID-${user.uid.substring(0, 8).toUpperCase()}` : "SID-MOCK123";
  const matriculationNumber = user?.uid ? `MAT-${user.uid.substring(9, 17).toUpperCase()}` : "MAT-MOCK456";
  const libraryNumber = user?.uid ? `LIB-${user.uid.substring(18, 26).toUpperCase()}` : "LIB-MOCK789";


  if (!isClient) {
    return ( 
      <div className="container mx-auto py-8">
        <Card className="max-w-2xl mx-auto shadow-xl overflow-hidden">
          <CardHeader className="pt-6">
            <CardTitle className="text-3xl sm:text-4xl font-bold text-foreground flex items-center">
              <Ticket className="mr-3 h-10 w-10 text-primary" /> {t('nav.semesterticket')}
            </CardTitle>
            <CardDescription className="text-lg text-muted-foreground">
              {t('semesterticket.loadingTicketInfo')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }


  return (
    <div className="container mx-auto py-8 space-y-12">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold flex items-center">
            <Ticket className="mr-3 h-8 w-8 text-primary" /> {t('semesterticket.pageTitle')}
          </CardTitle>
          <CardDescription>{t('semesterticket.pageDescription')}</CardDescription>
        </CardHeader>
      </Card>

      {/* Digital ID Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 text-foreground flex items-center"><IdCard className="mr-2 h-6 w-6 text-primary" /> {t('semesterticket.digitalIdSectionTitle')}</h2>
        <Card className="overflow-hidden shadow-xl bg-gradient-to-br from-primary to-blue-700 text-primary-foreground">
          <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6 relative">
            <div className="absolute top-4 right-4 bg-green-600 text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold flex items-center shadow-sm">
              <UserCheck className="mr-1.5 h-3.5 w-3.5" />
              {t('semesterticket.studentStatus')}
            </div>
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 border-accent shadow-lg shrink-0">
              <Image 
                src={user?.photoURL || `https://picsum.photos/seed/${studentId}/200/200`} 
                alt={studentName || 'Student photo'} 
                fill={true}
                sizes="(max-width: 640px) 8rem, 10rem" // 128px on small, 160px on sm+
                style={{objectFit: "cover"}}
                data-ai-hint="student portrait"
              />
            </div>
            <div className="flex-grow text-center sm:text-left space-y-1">
              <CardTitle className="text-3xl font-bold text-accent">{studentName}</CardTitle>
              <p className="text-lg">{t('semesterticket.universityName')}</p>
              
              <div className="pt-2 space-y-0.5 text-sm">
                 <p className="flex items-center justify-center sm:justify-start">
                  <Hash className="mr-1.5 h-4 w-4 opacity-90" /> 
                  {t('semesterticket.matriculationNo')} <span className="font-semibold ml-1">{matriculationNumber}</span>
                </p>
                 <p className="flex items-center justify-center sm:justify-start">
                  <Library className="mr-1.5 h-4 w-4 opacity-90" /> 
                  {t('semesterticket.libraryNo')} <span className="font-semibold ml-1">{libraryNumber}</span>
                </p>
                {expiryYear && (
                  <p className="flex items-center justify-center sm:justify-start">
                    <CalendarClock className="mr-1.5 h-4 w-4 opacity-90" /> 
                    {t('semesterticket.validUntil')} <span className="font-semibold ml-1">{t('semesterticket.monthAbbr.dec')} {expiryYear}</span>
                  </p>
                )}
              </div>
              <p className="text-xs mt-3 opacity-80 pt-2">{t('semesterticket.idPurpose')}</p>
            </div>
             <div className="sm:absolute bottom-4 right-4 text-center sm:text-right mt-4 sm:mt-0">
              <p className="text-xs">{t('semesterticket.studentIdLabel')}</p>
              <p className="text-sm font-semibold">{studentId}</p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Semesterticket Upload/Display Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 text-foreground flex items-center">
          <Ticket className="mr-2 h-6 w-6 text-primary" /> {t('semesterticket.semesterticketSectionTitle')}
        </h2>
        <Card className="max-w-2xl mx-auto shadow-xl overflow-hidden">
          <CardHeader className="pt-6">
            <CardTitle className="text-2xl font-bold text-foreground">
              {t('semesterticket.ticketCardTitle')}
            </CardTitle>
            <CardDescription className="text-md text-muted-foreground">
              {ticketImageDataUrl || pdfFallbackUrl ? t('semesterticket.ticketCardDescriptionView') : t('semesterticket.ticketCardDescriptionUpload')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {ticketImageDataUrl ? (
              <div className="space-y-4">
                <div className="border rounded-md overflow-hidden">
                  <Image 
                    src={ticketImageDataUrl} 
                    alt={t('semesterticket.ticketImageAlt')}
                    width={800} 
                    height={1131} 
                    style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
                    data-ai-hint="ticket image"
                  />
                </div>
                <Button 
                  onClick={handleReupload}
                  className="w-full text-base py-3"
                  size="lg"
                  variant="outline"
                >
                  <UploadCloud className="mr-2 h-5 w-5" /> {t('semesterticket.reuploadButton')}
                </Button>
              </div>
            ) : pdfFallbackUrl ? (
               <div className="space-y-4">
                  <Alert variant="default" className="shadow-sm">
                      <FileWarning className="h-5 w-5" />
                      <AlertTitle>{t('semesterticket.displayingPdfTitle')}</AlertTitle>
                      <AlertDescription>{t('semesterticket.displayingPdfDesc')}</AlertDescription>
                  </Alert>
                <iframe 
                  src={pdfFallbackUrl} 
                  className="w-full h-[500px] border rounded-md" 
                  title={t('semesterticket.ticketPdfTitle')}
                />
                <Button 
                  onClick={handleReupload}
                  className="w-full text-base py-3"
                  size="lg"
                  variant="outline"
                >
                  <UploadCloud className="mr-2 h-5 w-5" /> {t('semesterticket.reuploadButton')}
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="ticket-upload" className="text-base font-medium">{t('semesterticket.uploadLabel')}</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="ticket-upload"
                      type="file"
                      accept="application/pdf"
                      onChange={handleFileChange}
                      ref={fileInputRef}
                      className="flex-grow file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">{t('semesterticket.fileRequirements')}</p>
                </div>

                {selectedFile && (
                  <Card className="p-4 bg-muted/50 shadow-inner">
                    <CardHeader className="p-0 pb-2">
                      <CardTitle className="text-lg flex items-center justify-between">
                        {t('semesterticket.selectedFile')}
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}>
                          <X className="h-4 w-4" />
                          <span className="sr-only">{t('semesterticket.clearFile')}</span>
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 space-y-1">
                      <div className="flex items-center text-sm">
                        <FileText className="mr-2 h-5 w-5 text-primary" />
                        <span className="font-medium truncate max-w-[200px] sm:max-w-xs md:max-w-sm">{selectedFile.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {t('semesterticket.fileSize', { size: (selectedFile.size / 1024 / 1024).toFixed(2) })}
                      </p>
                    </CardContent>
                  </Card>
                )}

                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || processing}
                  className="w-full text-base py-3"
                  size="lg"
                >
                  {processing ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <ImageIcon className="mr-2 h-5 w-5" />
                  )}
                  {processing ? t('semesterticket.processing') : t('semesterticket.viewTicketButton')}
                </Button>
              </>
            )}
            
            <p className="text-sm text-muted-foreground pt-4 border-t">
              <strong>{t('semesterticket.importantNote')}</strong> {t('semesterticket.importantNoteDesc')}
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
