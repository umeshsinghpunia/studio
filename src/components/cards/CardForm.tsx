
"use client";

import React, { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ShieldCheck, User, CreditCard, CalendarDays, Building, Info } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import { db } from '@/lib/firebase/config';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import type { FinancialCard, CardProvider, CardType } from '@/types';
import { cardProviderOptions, cardTypeOptions } from '@/types';

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 15 }, (_, i) => (currentYear + i).toString());
const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));

const cardFormSchema = z.object({
  cardName: z.string().min(2, { message: 'Card name must be at least 2 characters.' }).max(50, { message: 'Card name too long.' }),
  cardHolderName: z.string().min(2, { message: 'Card holder name must be at least 2 characters.' }).max(100, { message: 'Card holder name too long.' }),
  lastFourDigits: z.string().length(4, { message: 'Must be exactly 4 digits.' }).regex(/^\d{4}$/, { message: 'Must be 4 digits.' }),
  expiryMonth: z.string().min(1, { message: 'Expiry month is required.' }),
  expiryYear: z.string().min(1, { message: 'Expiry year is required.' }),
  provider: z.string().min(1, { message: 'Please select a card provider.' }) as z.ZodType<CardProvider>,
  cardType: z.string().min(1, { message: 'Please select a card type.' }) as z.ZodType<CardType>,
  issuingBank: z.string().optional(),
  notes: z.string().max(500, { message: 'Notes too long.'}).optional(),
});

type CardFormValues = z.infer<typeof cardFormSchema>;

interface CardFormProps {
  mode: 'add' | 'edit';
  financialCard?: FinancialCard;
}

export default function CardForm({ mode, financialCard }: CardFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CardFormValues>({
    resolver: zodResolver(cardFormSchema),
    defaultValues: {
      cardName: financialCard?.cardName || '',
      cardHolderName: financialCard?.cardHolderName || '',
      lastFourDigits: financialCard?.lastFourDigits || '',
      expiryMonth: financialCard?.expiryMonth || '',
      expiryYear: financialCard?.expiryYear || '',
      provider: financialCard?.provider || undefined,
      cardType: financialCard?.cardType || undefined,
      issuingBank: financialCard?.issuingBank || '',
      notes: financialCard?.notes || '',
    },
  });

  async function onSubmit(values: CardFormValues) {
    if (!user) {
      toast({ title: 'Error', description: 'You must be logged in.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);

    const cardData = {
      ...values,
      userId: user.uid,
      updatedAt: new Date().toISOString(),
    };

    try {
      if (mode === 'add') {
        await addDoc(collection(db, 'users', user.uid, 'financialCards'), {
          ...cardData,
          createdAt: new Date().toISOString(),
        });
        toast({ title: 'Card Added', description: 'New financial card recorded successfully.' });
      } else if (financialCard) {
        const cardRef = doc(db, 'users', user.uid, 'financialCards', financialCard.id);
        await updateDoc(cardRef, cardData);
        toast({ title: 'Card Updated', description: 'Card details saved.' });
      }
      router.push('/cards');
    } catch (error) {
      console.error('Error saving card:', error);
      toast({
        title: `Error ${mode === 'add' ? 'Adding' : 'Updating'} Card`,
        description: 'Could not save card. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="cardName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Card Nickname *</FormLabel>
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <FormControl>
                  <Input placeholder="e.g., My Primary Visa, Office Amex" {...field} className="pl-10" />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cardHolderName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name on Card *</FormLabel>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <FormControl>
                  <Input placeholder="John M Doe" {...field} className="pl-10" />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="lastFourDigits"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Four Digits *</FormLabel>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <FormControl>
                  <Input type="text" maxLength={4} placeholder="1234" {...field} className="pl-10" />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="expiryMonth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expiry Month *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground opacity-0 sm:opacity-100" />
                      <SelectValue placeholder="MM" className="pl-2 sm:pl-10" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {months.map(month => <SelectItem key={month} value={month}>{month}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="expiryYear"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expiry Year *</FormLabel>
                 <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="YYYY" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {years.map(year => <SelectItem key={year} value={year}>{year}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="provider"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Card Provider *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                    <SelectTrigger>
                        <Info className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground opacity-0 sm:opacity-100" />
                        <SelectValue placeholder="Select provider" className="pl-2 sm:pl-10" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                    {cardProviderOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="cardType"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Card Type *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                    {cardTypeOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

        <FormField
          control={form.control}
          name="issuingBank"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Issuing Bank (Optional)</FormLabel>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <FormControl>
                  <Input placeholder="e.g., Chase, Bank of America" {...field} className="pl-10" />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Any additional notes about this card..." className="resize-none" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
          {isLoading ? <LoadingSpinner size={20} /> : (mode === 'add' ? 'Add Card' : 'Save Changes')}
        </Button>
      </form>
    </Form>
  );
}

