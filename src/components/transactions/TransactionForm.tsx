
"use client";

import React, { useEffect, useState } from 'react';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { CalendarIcon, CircleDollarSign, Landmark, PiggyBank, LandmarkIcon, Briefcase, Laptop, TrendingUp, Gift, Utensils, Car, FileText, Home, Gamepad2, HeartPulse, ShoppingBag, School } from 'lucide-react';
import type { Transaction, TransactionType, Category, AppUser } from '@/types';
import { TransactionCategories } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase/config';
import { collection, addDoc, doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import LoadingSpinner from '@/components/LoadingSpinner';
import { getLucideIcon } from '@/lib/icons';
import { appConfig } from '@/config/app';
import { getCountryByCode } from '@/lib/countries';

const transactionFormSchema = z.object({
  type: z.enum(['income', 'expense'], { required_error: 'Please select a transaction type.' }),
  categoryId: z.string().min(1, { message: 'Please select a category.' }),
  amount: z.coerce.number().positive({ message: 'Amount must be positive.' }),
  date: z.date({ required_error: 'Please select a date.' }),
  notes: z.string().optional(),
});

type TransactionFormValues = z.infer<typeof transactionFormSchema>;

interface TransactionFormProps {
  mode: 'add' | 'edit';
  transaction?: Transaction;
}

export default function TransactionForm({ mode, transaction }: TransactionFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<TransactionType>(transaction?.type || 'expense');
  const [availableCategories, setAvailableCategories] = useState<Category[]>(TransactionCategories[selectedType]);
  const [currencySymbol, setCurrencySymbol] = useState(appConfig.defaultCurrencySymbol);


  useEffect(() => {
    if (user) {
      const fetchUserProfile = async () => {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data() as AppUser;
          if (userData.country) {
            if (userData.country.currencySymbol) {
              setCurrencySymbol(userData.country.currencySymbol);
            } else if (userData.country.code) {
              const countryFromList = getCountryByCode(userData.country.code);
              if (countryFromList && countryFromList.currencySymbol) {
                setCurrencySymbol(countryFromList.currencySymbol);
              } else {
                setCurrencySymbol(appConfig.defaultCurrencySymbol);
              }
            } else {
              setCurrencySymbol(appConfig.defaultCurrencySymbol);
            }
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

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      type: transaction?.type || 'expense',
      categoryId: transaction?.category.id || '',
      amount: transaction?.amount || undefined, // Keep as undefined for placeholder to show
      date: transaction?.date ? parseISO(transaction.date) : new Date(),
      notes: transaction?.notes || '',
    },
  });

  useEffect(() => {
    setSelectedType(form.watch('type') as TransactionType);
  }, [form.watch('type')]);

  useEffect(() => {
    setAvailableCategories(TransactionCategories[selectedType] || []);
    if (mode === 'add' || (transaction && transaction.type !== selectedType)) {
      // Reset category if type changes or if it's a new form
      form.setValue('categoryId', '');
    }
  }, [selectedType, mode, transaction, form]);
  
  useEffect(() => {
    if (mode === 'edit' && transaction) {
      form.reset({
        type: transaction.type,
        categoryId: transaction.category.id,
        amount: transaction.amount,
        date: parseISO(transaction.date),
        notes: transaction.notes || '',
      });
      setSelectedType(transaction.type); // Ensure type is correctly set on edit
    }
  }, [mode, transaction, form]);


  async function onSubmit(values: TransactionFormValues) {
    if (!user) {
      toast({ title: 'Error', description: 'You must be logged in.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);

    const selectedCategory = availableCategories.find(cat => cat.id === values.categoryId);
    if (!selectedCategory) {
      toast({ title: 'Error', description: 'Invalid category selected.', variant: 'destructive' });
      setIsLoading(false);
      return;
    }

    const transactionData = {
      userId: user.uid,
      type: values.type,
      amount: values.amount,
      category: selectedCategory,
      date: values.date.toISOString(), // Store as ISO string
      notes: values.notes || '',
      updatedAt: new Date().toISOString(),
    };

    try {
      if (mode === 'add') {
        await addDoc(collection(db, 'users', user.uid, 'transactions'), {
          ...transactionData,
          createdAt: new Date().toISOString(),
        });
        toast({ title: 'Transaction Added', description: 'New transaction recorded successfully.' });
      } else if (transaction) {
        const transactionRef = doc(db, 'users', user.uid, 'transactions', transaction.id);
        await updateDoc(transactionRef, transactionData);
        toast({ title: 'Transaction Updated', description: 'Transaction details saved.' });
      }
      router.push('/transactions');
    } catch (error) {
      console.error('Error saving transaction:', error);
      toast({
        title: `Error ${mode === 'add' ? 'Adding' : 'Updating'} Transaction`,
        description: 'Could not save transaction. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const currentCategoryId = form.watch('categoryId');
  const selectedCategoryForDisplay = availableCategories.find(cat => cat.id === currentCategoryId);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Transaction Type *</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedType(value as TransactionType);
                  }}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1 sm:flex-row sm:space-y-0 sm:space-x-4"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="expense" />
                    </FormControl>
                    <FormLabel className="font-normal">Expense</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="income" />
                    </FormControl>
                    <FormLabel className="font-normal">Income</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    {selectedCategoryForDisplay ? (
                      <div className="flex items-center gap-2">
                        {React.createElement(getLucideIcon(selectedCategoryForDisplay.icon), { className: "h-4 w-4 text-muted-foreground" })}
                        {selectedCategoryForDisplay.name}
                      </div>
                    ) : (
                      <SelectValue placeholder="Select a category" />
                    )}
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableCategories.map((cat) => {
                    const Icon = getLucideIcon(cat.icon);
                    return (
                       <SelectItem key={cat.id} value={cat.id}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          {cat.name}
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
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount *</FormLabel>
               <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-muted-foreground sm:text-sm">{currencySymbol}</span>
                </div>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    value={field.value ?? ''} // Ensure controlled component even if undefined
                    className="pl-7"
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date *</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                    initialFocus
                  />
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
                <Textarea placeholder="Add any relevant notes..." className="resize-none" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
          {isLoading ? <LoadingSpinner size={20} /> : (mode === 'add' ? 'Add Transaction' : 'Save Changes')}
        </Button>
      </form>
    </Form>
  );
}
