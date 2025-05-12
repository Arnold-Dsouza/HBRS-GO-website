
"use client";
import type { StudentServiceContact } from '@/services/student-services';
import { getStudentServicesContactInfo } from '@/services/student-services';
import { useEffect, useState, type FormEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Mail, Phone, MapPin, Clock, FileText, Users, Loader2, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useLanguage } from '@/context/LanguageContext'; // Added

export default function StudentServicesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage(); // Added
  const [contacts, setContacts] = useState<StudentServiceContact[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [errorContacts, setErrorContacts] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    async function fetchContacts() {
      try {
        setLoadingContacts(true);
        setErrorContacts(null);
        const data = await getStudentServicesContactInfo();
        setContacts(data);
      } catch (err) {
        console.error("Failed to fetch student services contacts:", err);
        setErrorContacts(t('services.errorLoadingContactsDesc'));
      } finally {
        setLoadingContacts(false);
      }
    }
    fetchContacts();
  }, [t]);

  const handleFormSubmit = async (event: FormEvent<HTMLFormElement>, formNameKey: string) => {
    event.preventDefault();
    setFormLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setFormLoading(false);
    toast({
      title: t('services.formSubmittedTitle'),
      description: t('services.formSubmittedDesc', { formName: t(formNameKey) }),
      variant: "default", 
    });
    (event.target as HTMLFormElement).reset();
  };


  return (
    <div className="container mx-auto py-8 space-y-12">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold flex items-center">
            <Users className="mr-3 h-8 w-8 text-primary" /> {t('services.pageTitle')}
          </CardTitle>
          <CardDescription>{t('services.pageDescription')}</CardDescription>
        </CardHeader>
      </Card>
      
      {/* Forms Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 text-foreground flex items-center"><FileText className="mr-2 h-6 w-6 text-primary" /> {t('services.formsSectionTitle')}</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>{t('services.leaveAbsenceTitle')}</CardTitle>
              <CardDescription>{t('services.leaveAbsenceDesc')}</CardDescription>
            </CardHeader>
            <form onSubmit={(e) => handleFormSubmit(e, "services.leaveAbsenceTitle")}>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="leave-reason">{t('services.leaveReasonLabel')}</Label>
                  <Select required>
                    <SelectTrigger id="leave-reason">
                      <SelectValue placeholder={t('services.selectReason')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="medical">{t('services.medicalReason')}</SelectItem>
                      <SelectItem value="personal">{t('services.personalReason')}</SelectItem>
                      <SelectItem value="internship">{t('services.internshipReason')}</SelectItem>
                      <SelectItem value="other">{t('services.otherReason')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="leave-details">{t('services.additionalDetailsLabel')}</Label>
                  <Textarea id="leave-details" placeholder={t('services.additionalDetailsPlaceholder')} />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={formLoading} className="w-full">
                  {formLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : t('services.submitLeaveButton')}
                </Button>
              </CardFooter>
            </form>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>{t('services.feeRefundTitle')}</CardTitle>
              <CardDescription>{t('services.feeRefundDesc')}</CardDescription>
            </CardHeader>
             <form onSubmit={(e) => handleFormSubmit(e, "services.feeRefundTitle")}>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="refund-reason">{t('services.refundReasonLabel')}</Label>
                   <Select required>
                    <SelectTrigger id="refund-reason">
                      <SelectValue placeholder={t('services.selectReason')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="overpayment">{t('services.overpaymentReason')}</SelectItem>
                      <SelectItem value="withdrawal">{t('services.withdrawalReason')}</SelectItem>
                      <SelectItem value="other">{t('services.otherSpecifyReason')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                 <div className="space-y-1">
                  <Label htmlFor="bank-account">{t('services.bankAccountLabel')}</Label>
                  <Input id="bank-account" type="text" placeholder={t('services.bankAccountPlaceholder')} required/>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={formLoading} className="w-full">
                 {formLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : t('services.submitRefundButton')}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </section>

      {/* Contact Information Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 text-foreground flex items-center"><Users className="mr-2 h-6 w-6 text-primary" /> {t('services.contactSectionTitle')}</h2>
        {loadingContacts && <ContactLoadingSkeleton />}
        {errorContacts && (
             <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{t('services.errorLoadingContactsTitle')}</AlertTitle>
                <AlertDescription>{errorContacts}</AlertDescription>
            </Alert>
        )}
        {!loadingContacts && !errorContacts && contacts.length === 0 && (
             <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{t('services.noContactsTitle')}</AlertTitle>
                <AlertDescription>{t('services.noContactsDesc')}</AlertDescription>
            </Alert>
        )}
        {!loadingContacts && !errorContacts && contacts.length > 0 && (
            <div className="grid md:grid-cols-2 gap-6">
            {contacts.map(contact => (
                <Card key={contact.name} className="shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                    <CardTitle className="text-xl text-primary group-hover:text-accent transition-colors">{contact.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <p className="flex items-center"><Mail className="mr-2 h-4 w-4 text-muted-foreground" /> <a href={`mailto:${contact.email}`} className="hover:underline text-foreground">{contact.email}</a></p>
                    <p className="flex items-center"><Phone className="mr-2 h-4 w-4 text-muted-foreground" /> <a href={`tel:${contact.phone}`} className="hover:underline text-foreground">{contact.phone}</a></p>
                    <p className="flex items-center"><MapPin className="mr-2 h-4 w-4 text-muted-foreground" /> {contact.office}</p>
                    <p className="flex items-center"><Clock className="mr-2 h-4 w-4 text-muted-foreground" /> {contact.officeHours}</p>
                </CardContent>
                </Card>
            ))}
            </div>
        )}
      </section>
    </div>
  );
}

function ContactLoadingSkeleton() {
    return (
         <div className="grid md:grid-cols-2 gap-6">
            {[1,2].map(i => (
                <Card key={i} className="shadow-lg">
                    <CardHeader>
                        <Skeleton className="h-6 w-3/5 mb-2" />
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Skeleton className="h-5 w-4/5" />
                        <Skeleton className="h-5 w-3/5" />
                        <Skeleton className="h-5 w-2/5" />
                        <Skeleton className="h-5 w-4/5" />
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
