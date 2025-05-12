"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, NfcIcon, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

// Mock card data - in a real app this would come from the NFC reading
const mockCardData = {
  id: "HBRS-9876543",
  holder: "Max Mustermann",
  balance: 15.50,
  validUntil: "2025-09-30"
};

export default function CardRechargePage() {
  const { t } = useLanguage();
  const { toast } = useToast();

  const [cardDetected, setCardDetected] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [cardData, setCardData] = useState<typeof mockCardData | null>(null);
  const [amount, setAmount] = useState("10.00");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);

  // Simulates NFC card detection
  const handleReadCard = () => {
    setIsReading(true);
    
    setTimeout(() => {
      setIsReading(false);
      setCardDetected(true);
      setCardData(mockCardData);
      
      toast({
        title: t('cardRecharge.cardDetected'),
        description: t('cardRecharge.cardDetailsLoaded'),
      });
    }, 2000); // Simulate a 2-second card detection process
  };

  const handleRecharge = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: t('cardRecharge.invalidAmount'),
        description: t('cardRecharge.enterValidAmount'),
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentComplete(true);
      
      if (cardData) {
        const newBalance = cardData.balance + parseFloat(amount);
        setCardData({...cardData, balance: newBalance});
      }

      toast({
        title: t('cardRecharge.rechargeSuccess'),
        description: t('cardRecharge.amountAdded', { amount }),
      });
    }, 3000);
  };

  const resetProcess = () => {
    setCardDetected(false);
    setCardData(null);
    setAmount("10.00");
    setPaymentComplete(false);
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold flex items-center">
            <CreditCard className="mr-3 h-8 w-8 text-primary" /> {t('cardRecharge.title')}
          </CardTitle>
          <CardDescription>{t('cardRecharge.description')}</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Card Detection Section */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center">
              <NfcIcon className="mr-2 text-primary" /> {t('cardRecharge.cardDetection')}
            </CardTitle>
            <CardDescription>
              {t('cardRecharge.cardDetectionDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!cardDetected ? (
              <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg">
                <NfcIcon className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-center text-muted-foreground mb-6">
                  {t('cardRecharge.tapCardInstruction')}
                </p>
                <Button 
                  onClick={handleReadCard} 
                  disabled={isReading}
                  className="gap-2"
                >
                  {isReading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isReading 
                    ? t('cardRecharge.reading') 
                    : t('cardRecharge.readCard')
                  }
                </Button>
              </div>
            ) : (
              <>
                <Alert className="bg-green-50 text-green-800 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertTitle>{t('cardRecharge.cardDetected')}</AlertTitle>
                  <AlertDescription>
                    {t('cardRecharge.cardSuccessfullyRead')}
                  </AlertDescription>
                </Alert>

                {cardData && (
                  <div className="space-y-4 mt-4">
                    <div className="flex justify-center mb-6">
                      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-xl w-full max-w-sm shadow-lg text-white">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-xs opacity-75">{t('cardRecharge.studentCard')}</p>
                            <h3 className="text-xl font-semibold mt-1">{cardData.holder}</h3>
                          </div>
                          <NfcIcon className="h-8 w-8 opacity-75" />
                        </div>
                        <div className="mt-4">
                          <p className="text-xs opacity-75">{t('cardRecharge.cardNumber')}</p>
                          <p className="font-mono">{cardData.id}</p>
                        </div>
                        <div className="flex justify-between mt-4">
                          <div>
                            <p className="text-xs opacity-75">{t('cardRecharge.currentBalance')}</p>
                            <p className="font-bold text-xl">€{cardData.balance.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-xs opacity-75">{t('cardRecharge.validUntil')}</p>
                            <p>{cardData.validUntil}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Payment Section */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="mr-2 text-primary" /> {t('cardRecharge.payment')}
            </CardTitle>
            <CardDescription>
              {t('cardRecharge.paymentDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!cardDetected ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{t('cardRecharge.cardRequired')}</AlertTitle>
                <AlertDescription>
                  {t('cardRecharge.detectCardFirst')}
                </AlertDescription>
              </Alert>
            ) : paymentComplete ? (
              <div className="flex flex-col items-center text-center p-6">
                <div className="rounded-full bg-green-100 p-3 mb-4">
                  <CheckCircle2 className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{t('cardRecharge.rechargeSuccess')}</h3>
                <p className="text-muted-foreground mb-6">
                  {t('cardRecharge.rechargeSummary', { 
                    amount: parseFloat(amount).toFixed(2),
                    balance: cardData ? cardData.balance.toFixed(2) : '0.00'
                  })}
                </p>
                <Button onClick={resetProcess}>
                  {t('cardRecharge.rechargeAnother')}
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="amount">{t('cardRecharge.amount')}</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5">€</span>
                    <Input
                      id="amount"
                      type="number"
                      min="0.50"
                      step="0.50"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pl-7"
                      placeholder="10.00"
                      disabled={isProcessing}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t('cardRecharge.minimumAmount')}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment-method">{t('cardRecharge.paymentMethod')}</Label>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 border-2 h-24" disabled={isProcessing}>
                      <div className="flex flex-col items-center">
                        <CreditCard className="h-8 w-8 mb-2" />
                        <span>{t('cardRecharge.creditCard')}</span>
                      </div>
                    </Button>
                    <Button variant="outline" className="flex-1 border-2 h-24" disabled={isProcessing}>
                      <div className="flex flex-col items-center">
                        <Image 
                          src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/124px-PayPal.svg.png"
                          width={80}
                          height={20}
                          alt="PayPal"
                          className="mb-2"
                        />
                        <span>PayPal</span>
                      </div>
                    </Button>
                  </div>
                </div>

                <Button 
                  onClick={handleRecharge} 
                  className="w-full"
                  disabled={!cardDetected || isProcessing}
                >
                  {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isProcessing 
                    ? t('cardRecharge.processing') 
                    : t('cardRecharge.rechargeCard', { amount: parseFloat(amount).toFixed(2) })
                  }
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}