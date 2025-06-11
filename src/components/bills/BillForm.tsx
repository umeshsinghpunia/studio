
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, DollarSign, Tag, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import { appConfig } from '@/config/app';
import type { AppUser } from '@/types';
import { getCountryByCode } from '@/lib/countries';
import { db } from '@/lib/firebase/config'; // Placeholder for future Firestore integration
import { doc, getDoc } from 'firebase/firestore'; // Placeholder

// Placeholder types - replace with actual types when backend is integrated
interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string; // ISO string
  category?: string;
  notes?: string;
}

const billFormSchema = z.object({
  name: z.string().min(2, { message: 'Bill name must be at least 2 characters.' }),
  amount: z.coerce.number().positive({ message: 'Amount must be positive.' }),
  dueDate: z.date({ required_error: 'Please select a due date.' }),
  category: z.string().optional(),
  notes: z.string().optional(),
});

type BillFormValues = z.infer<typeof billFormSchema>;

interface BillFormProps {
  mode: 'add' | 'edit';
  bill?: Bill; // For edit mode
}

export default function BillForm({ mode, bill }: BillFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [currencySymbol, setCurrencySymbol] = useState(appConfig.defaultCurrencySymbol);

  useEffect(() => {
    if (user) {
      const fetchUserProfile = async () => {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data() as AppUser;
          if (userData.country) {
            const countryDetails = getCountryByCode(userData.country.code);
            setCurrencySymbol(countryDetails?.currencySymbol || appConfig.defaultCurrencySymbol);
          } else {
            setCurrencySymbol(appConfig.defaultCurrencySymbol);
          }
        } else {
          setCurrencySymbol(appConfig.defaultCurrencySymbol);
        }
      };
      fetchUserProfile();
    } else {
      setCurrencySymbol(appConfig.defaultCurrencySymbol);
    }
  }, [user]);

  const form = useForm<BillFormValues>({
    resolver: zodResolver(billFormSchema),
    defaultValues: {
      name: bill?.name || '',
      amount: bill?.amount || undefined,
      dueDate: bill?.dueDate ? new Date(bill.dueDate) : new Date(),
      category: bill?.category || '',
      notes: bill?.notes || '',
    },
  });

  async function onSubmit(values: BillFormValues) {
    if (!user) {
      toast({ title: 'Error', description: 'You must be logged in.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);

    const billData = {
      userId: user.uid,
      name: values.name,
      amount: values.amount,
      dueDate: values.dueDate.toISOString(),
      category: values.category || '',
      notes: values.notes || '',
      // Add status: 'unpaid' or similar later
    };

    // Placeholder for actual submission logic
    console.log('Bill data:', billData);

    try {
      if (mode === 'add') {
        // await addDoc(collection(db, 'users', user.uid, 'bills'), billData); // Example
        toast({ title: 'Bill Added (Placeholder)', description: 'New bill recorded successfully.' });
      } else if (bill) {
        // const billRef = doc(db, 'users', user.uid, 'bills', bill.id); // Example
        // await updateDoc(billRef, billData); // Example
        toast({ title: 'Bill Updated (Placeholder)', description: 'Bill details saved.' });
      }
      router.push('/bills'); // Navigate to bills list page
    } catch (error) {
      console.error('Error saving bill:', error);
      toast({
        title: `Error ${mode === 'add' ? 'Adding' : 'Updating'} Bill`,
        description: 'Could not save bill. Please try again.',
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bill Name *</FormLabel>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <FormControl>
                  <Input placeholder="e.g., Electricity Bill, Rent" {...field} className="pl-10" />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount *</FormLabel>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground sm:text-sm">{currencySymbol}</span>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="0.00" {...field} value={field.value ?? ''} className="pl-8" />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dueDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Due Date *</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                    >
                      {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category (Optional)</FormLabel>
               <div className="relative">
                <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <FormControl>
                  <Input placeholder="e.g., Utilities, Housing" {...field} className="pl-10" />
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
                <Textarea placeholder="Add any relevant notes or details..." className="resize-none" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
          {isLoading ? <LoadingSpinner size={20} /> : (mode === 'add' ? 'Add Bill' : 'Save Changes')}
        </Button>
      </form>
    </Form>
  );
}
