
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, Briefcase, Tag, FileText, Hash, LineChart, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { appConfig } from '@/config/app';
import type { AppUser, Investment, InvestmentType } from '@/types';
import { investmentTypeOptions } from '@/types'; // Import investment types
import { getCountryByCode } from '@/lib/countries';
import { db } from '@/lib/firebase/config';
import { doc, getDoc, addDoc, updateDoc, collection, serverTimestamp } from 'firebase/firestore';
import { getLucideIcon } from '@/lib/icons';


const investmentFormSchema = z.object({
  name: z.string().min(2, { message: 'Investment name must be at least 2 characters.' }),
  type: z.string().min(1, { message: 'Please select an investment type.' }) as z.ZodType<InvestmentType>,
  amountInvested: z.coerce.number().positive({ message: 'Amount invested must be positive.' }),
  investmentDate: z.date({ required_error: 'Please select an investment date.' }),
  quantity: z.coerce.number().optional().nullable(),
  notes: z.string().optional(),
});

type InvestmentFormValues = z.infer<typeof investmentFormSchema>;

interface InvestmentFormProps {
  mode: 'add' | 'edit';
  investment?: Investment; // For edit mode
}

export default function InvestmentForm({ mode, investment }: InvestmentFormProps) {
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

  const form = useForm<InvestmentFormValues>({
    resolver: zodResolver(investmentFormSchema),
    defaultValues: {
      name: investment?.name || '',
      type: investment?.type || undefined,
      amountInvested: investment?.amountInvested || undefined,
      investmentDate: investment?.investmentDate ? new Date(investment.investmentDate) : new Date(),
      quantity: investment?.quantity || undefined,
      notes: investment?.notes || '',
    },
  });

  async function onSubmit(values: InvestmentFormValues) {
    if (!user) {
      toast({ title: 'Error', description: 'You must be logged in.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);

    const selectedTypeOption = investmentTypeOptions.find(opt => opt.value === values.type);
    if (!selectedTypeOption) {
        toast({ title: 'Error', description: 'Invalid investment type selected.', variant: 'destructive' });
        setIsLoading(false);
        return;
    }

    const investmentData = {
      userId: user.uid,
      name: values.name,
      type: values.type,
      typeName: selectedTypeOption.label,
      typeIcon: selectedTypeOption.icon,
      amountInvested: values.amountInvested,
      investmentDate: values.investmentDate.toISOString(),
      quantity: values.quantity || null,
      notes: values.notes || '',
      currentValue: values.amountInvested, // Initial current value can be the invested amount
      updatedAt: new Date().toISOString(),
    };

    try {
      if (mode === 'add') {
        await addDoc(collection(db, 'users', user.uid, 'investments'), {
            ...investmentData,
            createdAt: new Date().toISOString(),
        });
        toast({ title: 'Investment Added', description: 'New investment recorded successfully.' });
      } else if (investment) {
        const investmentRef = doc(db, 'users', user.uid, 'investments', investment.id);
        await updateDoc(investmentRef, investmentData);
        toast({ title: 'Investment Updated', description: 'Investment details saved.' });
      }
      router.push('/investment'); // Navigate to investments list page
    } catch (error) {
      console.error('Error saving investment:', error);
      toast({
        title: `Error ${mode === 'add' ? 'Adding' : 'Updating'} Investment`,
        description: 'Could not save investment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }
  
  const currentType = form.watch('type');
  const selectedTypeForDisplay = investmentTypeOptions.find(opt => opt.value === currentType);


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Investment Name *</FormLabel>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <FormControl>
                  <Input placeholder="e.g., Apple Stock, Vanguard S&P 500 ETF" {...field} className="pl-10" />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Investment Type *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                <FormControl>
                   <SelectTrigger className="pl-10">
                    {selectedTypeForDisplay ? (
                      <div className="flex items-center gap-2">
                        {React.createElement(getLucideIcon(selectedTypeForDisplay.icon, 'Package'), { className: "h-4 w-4 text-muted-foreground" })}
                        {selectedTypeForDisplay.label}
                      </div>
                    ) : (
                      <>
                        <LineChart className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <SelectValue placeholder="Select an investment type" />
                      </>
                    )}
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {investmentTypeOptions.map((option) => {
                    const Icon = getLucideIcon(option.icon, 'Package');
                    return (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          {option.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amountInvested"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount Invested *</FormLabel>
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
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantity (Optional)</FormLabel>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <FormControl>
                  <Input type="number" step="any" placeholder="e.g., 10 (shares), 0.5 (BTC)" {...field} value={field.value ?? ''} className="pl-10" />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />


        <FormField
          control={form.control}
          name="investmentDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Investment Date *</FormLabel>
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
                  <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus disabled={(date) => date > new Date()}/>
                </PopoverContent>
              </Popover>
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
                <Textarea placeholder="Add any relevant notes, broker details, etc." className="resize-none" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
          {isLoading ? <LoadingSpinner size={20} /> : (mode === 'add' ? 'Add Investment' : 'Save Changes')}
        </Button>
      </form>
    </Form>
  );
}
