
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
import { format, parseISO } from 'date-fns';
import { CalendarIcon, Target, DollarSign, Info, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import { db } from '@/lib/firebase/config';
import { collection, addDoc, doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import type { FinancialGoal, AppUser } from '@/types';
import { appConfig } from '@/config/app';
import { getCountryByCode } from '@/lib/countries';


const goalFormSchema = z.object({
  goalName: z.string().min(2, { message: 'Goal name must be at least 2 characters.' }).max(100, { message: 'Goal name too long.'}),
  targetAmount: z.coerce.number().positive({ message: 'Target amount must be positive.' }),
  currentAmount: z.coerce.number().nonnegative({ message: 'Current amount cannot be negative.' }).optional(),
  targetDate: z.date().optional().nullable(),
  description: z.string().max(500, { message: 'Description too long.'}).optional(),
  icon: z.string().optional(), // Optional Lucide icon name
});

type GoalFormValues = z.infer<typeof goalFormSchema>;

interface GoalFormProps {
  mode: 'add' | 'edit';
  financialGoal?: FinancialGoal;
}

export default function GoalForm({ mode, financialGoal }: GoalFormProps) {
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
          }
        }
      };
      fetchUserProfile();
    }
  }, [user]);


  const form = useForm<GoalFormValues>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: {
      goalName: financialGoal?.goalName || '',
      targetAmount: financialGoal?.targetAmount || undefined,
      currentAmount: financialGoal?.currentAmount || 0,
      targetDate: financialGoal?.targetDate ? parseISO(financialGoal.targetDate) : undefined,
      description: financialGoal?.description || '',
      icon: financialGoal?.icon || '',
    },
  });

  async function onSubmit(values: GoalFormValues) {
    if (!user) {
      toast({ title: 'Error', description: 'You must be logged in.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);

    const goalData = {
      ...values,
      userId: user.uid,
      currentAmount: values.currentAmount || 0,
      targetDate: values.targetDate ? values.targetDate.toISOString() : null,
      updatedAt: new Date().toISOString(),
    };

    try {
      if (mode === 'add') {
        await addDoc(collection(db, 'users', user.uid, 'financialGoals'), {
          ...goalData,
          createdAt: new Date().toISOString(),
        });
        toast({ title: 'Goal Added', description: 'New financial goal recorded successfully.' });
      } else if (financialGoal) {
        const goalRef = doc(db, 'users', user.uid, 'financialGoals', financialGoal.id);
        await updateDoc(goalRef, goalData);
        toast({ title: 'Goal Updated', description: 'Goal details saved.' });
      }
      router.push('/goals');
    } catch (error) {
      console.error('Error saving goal:', error);
      toast({
        title: `Error ${mode === 'add' ? 'Adding' : 'Updating'} Goal`,
        description: 'Could not save goal. Please try again.',
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
          name="goalName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Goal Name *</FormLabel>
              <div className="relative">
                <Target className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <FormControl>
                  <Input placeholder="e.g., New Car, Vacation Fund" {...field} className="pl-10" />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="targetAmount"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Target Amount *</FormLabel>
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
            name="currentAmount"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Current Amount Saved (Optional)</FormLabel>
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
        </div>
        

        <FormField
          control={form.control}
          name="targetDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Target Date (Optional)</FormLabel>
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
                  <Calendar mode="single" selected={field.value || undefined} onSelect={field.onChange} initialFocus />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Icon Name (Optional)</FormLabel>
              <div className="relative">
                <ImageIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <FormControl>
                  <Input placeholder="e.g., Car, Home, Gift (Lucide icon name)" {...field} value={field.value ?? ''} className="pl-10" />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Add more details about your goal..." className="resize-none" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
          {isLoading ? <LoadingSpinner size={20} /> : (mode === 'add' ? 'Add Goal' : 'Save Changes')}
        </Button>
      </form>
    </Form>
  );
}

