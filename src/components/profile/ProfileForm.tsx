
"use client";

import { zodResolver } from '@hookform/resolvers/zod';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { User, Phone, Globe, Mail } from 'lucide-react';

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
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase/config';
import { useAuth } from '@/contexts/AuthContext';
import type { AppUser, Country } from '@/types';
import CountrySelector from '@/components/shared/CountrySelector';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { updateProfile as updateFirebaseProfile } from 'firebase/auth';

const profileFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email(),
  mobile: z.string().optional().nullable(),
  country: z.custom<Country | null>().nullable(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfileForm() {
  const { user: firebaseUser, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: '',
      email: '',
      mobile: '',
      country: null,
    },
  });

  useEffect(() => {
    if (firebaseUser) {
      const fetchProfile = async () => {
        setIsLoading(true);
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data() as AppUser;
          form.reset({
            name: userData.name || firebaseUser.displayName || '',
            email: userData.email || firebaseUser.email || '',
            mobile: userData.mobile || '',
            country: userData.country || null,
          });
        } else {
          // Initialize profile if it doesn't exist (e.g., for older users)
          form.reset({
            name: firebaseUser.displayName || '',
            email: firebaseUser.email || '',
            mobile: '',
            country: null,
          });
        }
        setIsLoading(false);
      };
      fetchProfile();
    } else if (!authLoading) {
      setIsLoading(false); // Not logged in, nothing to load
    }
  }, [firebaseUser, form, authLoading]);

  async function onSubmit(values: ProfileFormValues) {
    if (!firebaseUser) {
      toast({ title: 'Error', description: 'You are not logged in.', variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);
    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);

      const profileData: Partial<AppUser> = {
        name: values.name,
        mobile: values.mobile || null,
        country: values.country || null,
      };

      if(userDoc.exists()){
        await updateDoc(userDocRef, profileData);
      } else {
        // This case should ideally be handled at signup, but as a fallback:
        await setDoc(userDocRef, {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          createdAt: new Date().toISOString(),
          ...profileData
        });
      }
      
      // Update Firebase Auth profile display name if it changed
      if (firebaseUser.displayName !== values.name) {
        await updateFirebaseProfile(firebaseUser, { displayName: values.name });
      }

      toast({ title: 'Profile Updated', description: 'Your profile has been successfully updated.' });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({ title: 'Update Failed', description: 'Could not update profile. Please try again.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size={32} />
      </div>
    );
  }
  
  if (!firebaseUser && !authLoading) {
     return <p className="text-center text-muted-foreground">Please log in to view your profile.</p>;
  }


  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="font-headline">Personal Information</CardTitle>
        <CardDescription>Update your name, contact details, and country.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <FormControl>
                      <Input placeholder="Your full name" {...field} className="pl-10" />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <FormControl>
                      <Input placeholder="your.email@example.com" {...field} readOnly disabled className="pl-10 bg-muted/50 cursor-not-allowed" />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="mobile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mobile Number (Optional)</FormLabel>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <FormControl>
                      <Input type="tel" placeholder="Your mobile number" {...field} value={field.value || ''} className="pl-10" />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Country (Optional)</FormLabel>
                  <div className="relative">
                     <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
                     <CountrySelector
                        selectedCountry={field.value}
                        onSelectCountry={(country) => field.onChange(country)}
                      />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSubmitting}>
              {isSubmitting ? <LoadingSpinner size={20} /> : 'Save Changes'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
