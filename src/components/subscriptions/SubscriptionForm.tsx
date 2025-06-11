
"use client";

import React, { useState, useEffect, useCallback } from 'react';
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
import { CalendarIcon, Repeat, Tag, CreditCard, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { appConfig } from '@/config/app';
import type { AppUser, Subscription, SubscriptionStatus } from '@/types';
import { getCountryByCode } from '@/lib/countries';
import { db } from '@/lib/firebase/config';
import { doc, getDoc, addDoc, updateDoc, collection, serverTimestamp } from 'firebase/firestore';

// Extend Window interface for Razorpay
declare global {
  interface Window {
    Razorpay: any;
  }
}

const RAZORPAY_KEY_ID_PLACEHOLDER = "rzp_test_YOUR_KEY_ID"; // Replace with your actual Key ID

const subscriptionFormSchema = z.object({
  name: z.string().min(2, { message: 'Subscription name must be at least 2 characters.' }),
  amount: z.coerce.number().positive({ message: 'Amount must be positive.' }),
  billingCycle: z.enum(['monthly', 'yearly', 'weekly', 'daily'], { required_error: 'Please select a billing cycle.' }),
  nextPaymentDate: z.date({ required_error: 'Please select the next payment date.' }),
  category: z.string().optional(),
  notes: z.string().optional(),
});

type SubscriptionFormValues = z.infer<typeof subscriptionFormSchema>;

interface SubscriptionFormProps {
  mode: 'add' | 'edit';
  subscription?: Subscription;
}

const billingCycles = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'daily', label: 'Daily' },
];

export default function SubscriptionForm({ mode, subscription }: SubscriptionFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [currencySymbol, setCurrencySymbol] = useState(appConfig.defaultCurrencySymbol);
  const [formValuesForPayment, setFormValuesForPayment] = useState<SubscriptionFormValues | null>(null);

  const loadRazorpayScript = useCallback(() => {
    return new Promise((resolve) => {
      if (document.getElementById('razorpay-checkout-js')) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.id = 'razorpay-checkout-js';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  }, []);

  useEffect(() => {
    loadRazorpayScript();
  }, [loadRazorpayScript]);

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

  const form = useForm<SubscriptionFormValues>({
    resolver: zodResolver(subscriptionFormSchema),
    defaultValues: {
      name: subscription?.name || '',
      amount: subscription?.amount || undefined,
      billingCycle: subscription?.billingCycle || 'monthly',
      nextPaymentDate: subscription?.nextPaymentDate ? new Date(subscription.nextPaymentDate) : new Date(),
      category: subscription?.category || '',
      notes: subscription?.notes || '',
    },
  });

  const handleRazorpaySuccess = async (
    razorpayResponse: {
      razorpay_payment_id: string;
      razorpay_order_id: string;
      razorpay_signature: string;
    },
    originalFormValues: SubscriptionFormValues
  ) => {
    if (!user) {
      toast({ title: 'Error', description: 'User not logged in.', variant: 'destructive' });
      setIsPaying(false);
      return;
    }

    setIsLoading(true); // Use general loading for Firestore op
    try {
      // STUB: Backend call to verify payment and save subscription
      // Replace with your actual backend API call
      // const verificationResponse = await fetch('/api/razorpay/verify-payment', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ ...razorpayResponse, ...originalFormValues, userId: user.uid }),
      // });
      // if (!verificationResponse.ok) throw new Error('Payment verification failed.');
      // const verificationData = await verificationResponse.json();

      // For prototype: directly save to Firestore after mock verification
      console.log('Razorpay success, proceed to save:', razorpayResponse, originalFormValues);

      const subscriptionDataToSave = {
        userId: user.uid,
        name: originalFormValues.name,
        amount: originalFormValues.amount,
        billingCycle: originalFormValues.billingCycle,
        nextPaymentDate: originalFormValues.nextPaymentDate.toISOString(),
        category: originalFormValues.category || '',
        notes: originalFormValues.notes || '',
        status: 'active' as SubscriptionStatus,
        razorpayOrderId: razorpayResponse.razorpay_order_id,
        razorpayPaymentId: razorpayResponse.razorpay_payment_id,
        // razorpaySubscriptionId: if using Razorpay Subscriptions API for recurring
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await addDoc(collection(db, 'users', user.uid, 'subscriptions'), subscriptionDataToSave);

      toast({ title: 'Subscription Added', description: 'New subscription active and payment successful.' });
      router.push('/subscriptions');

    } catch (error) {
      console.error('Error verifying payment or saving subscription:', error);
      toast({
        title: 'Payment Error',
        description: (error as Error).message || 'Could not process payment or save subscription. Please contact support.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setIsPaying(false);
    }
  };


  const initiateRazorpayPayment = async (values: SubscriptionFormValues) => {
    if (!user) {
      toast({ title: 'Error', description: 'You must be logged in.', variant: 'destructive' });
      return;
    }
    setIsPaying(true);
    setFormValuesForPayment(values); // Store form values for success handler

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded || !window.Razorpay) {
      toast({ title: 'Error', description: 'Razorpay SDK could not be loaded. Please try again.', variant: 'destructive' });
      setIsPaying(false);
      return;
    }

    try {
      // STUB: Backend call to create Razorpay order
      // Replace with your actual backend API call
      // const orderResponse = await fetch('/api/razorpay/create-order', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ amount: values.amount * 100, currency: 'INR' }) // amount in paise
      // });
      // if (!orderResponse.ok) throw new Error('Failed to create Razorpay order.');
      // const orderData = await orderResponse.json();
      // const orderId = orderData.id;

      // For prototype: Use a placeholder order_id or simulate order creation
      const orderId = `order_prototype_${Date.now()}`; // Placeholder
      console.log("Simulated Razorpay Order ID:", orderId, "Amount (Paise):", values.amount * 100);


      const options = {
        key: RAZORPAY_KEY_ID_PLACEHOLDER,
        amount: values.amount * 100, // Amount in paise
        currency: "INR",
        name: values.name,
        description: `Payment for ${values.name} subscription`,
        order_id: orderId,
        handler: (response: any) => {
          handleRazorpaySuccess(response, values);
        },
        prefill: {
          name: user.displayName || "Valued Customer",
          email: user.email || "",
          contact: "" // Can fetch from user profile if available
        },
        notes: {
          subscription_name: values.name,
          user_id: user.uid,
        },
        theme: {
          color: "#73B9BC" // Use primary color from your theme
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response: any) => {
        console.error('Razorpay payment failed:', response);
        toast({
          title: 'Payment Failed',
          description: response.error.description || 'Your payment could not be processed.',
          variant: 'destructive',
        });
        setIsPaying(false);
      });
      rzp.open();

    } catch (error) {
      console.error('Error initiating Razorpay payment:', error);
      toast({
        title: 'Payment Error',
        description: (error as Error).message || 'Could not initiate payment. Please try again.',
        variant: 'destructive',
      });
      setIsPaying(false);
    }
  };

  // This is for the 'edit' mode or if not using Razorpay
  async function onSubmit(values: SubscriptionFormValues) {
    if (!user) {
      toast({ title: 'Error', description: 'You must be logged in.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);

    const subscriptionData: Partial<Subscription> = {
      userId: user.uid,
      name: values.name,
      amount: values.amount,
      billingCycle: values.billingCycle,
      nextPaymentDate: values.nextPaymentDate.toISOString(),
      category: values.category || '',
      notes: values.notes || '',
      updatedAt: new Date().toISOString(),
    };

    try {
      if (mode === 'edit' && subscription) {
        const subRef = doc(db, 'users', user.uid, 'subscriptions', subscription.id);
        await updateDoc(subRef, subscriptionData);
        toast({ title: 'Subscription Updated', description: 'Subscription details saved.' });
        router.push('/subscriptions');
      } else {
        // This path should ideally not be hit for 'add' mode if Razorpay is primary.
        // It can be a fallback or for non-payment related 'add' scenarios if any.
        // For now, we assume 'add' mode uses Razorpay.
        toast({ title: 'Info', description: 'Please use the "Pay with Razorpay" button to add new subscriptions.', variant: 'default' });
      }
    } catch (error) {
      console.error('Error saving subscription:', error);
      toast({
        title: `Error ${mode === 'add' ? 'Adding' : 'Updating'} Subscription`,
        description: 'Could not save subscription. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form 
        onSubmit={mode === 'add' ? form.handleSubmit(initiateRazorpayPayment) : form.handleSubmit(onSubmit)} 
        className="space-y-6"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subscription Name *</FormLabel>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <FormControl>
                  <Input placeholder="e.g., Netflix, Spotify Premium" {...field} className="pl-10" />
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
              <FormLabel>Amount per Cycle ({currencySymbol}) *</FormLabel>
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
          name="billingCycle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Billing Cycle *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="pl-10">
                     <Repeat className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <SelectValue placeholder="Select a billing cycle" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {billingCycles.map((cycle) => (
                    <SelectItem key={cycle.value} value={cycle.value}>
                      {cycle.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nextPaymentDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Next Payment Date *</FormLabel>
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
                  <Input placeholder="e.g., Entertainment, Software" {...field} className="pl-10" />
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

        {mode === 'add' ? (
          <Button type="submit" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isPaying || isLoading}>
            {isPaying ? <LoadingSpinner size={20} className="mr-2" /> : <CreditCard className="mr-2 h-4 w-4" />}
            {isPaying ? 'Processing...' : 'Proceed to Pay with Razorpay'}
          </Button>
        ) : (
          <Button type="submit" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
            {isLoading ? <LoadingSpinner size={20} /> : 'Save Changes'}
          </Button>
        )}
      </form>
    </Form>
  );
}
