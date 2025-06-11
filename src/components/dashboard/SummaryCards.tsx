
"use client"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { AppUser } from '@/types';
import { appConfig } from '@/config/app';


interface SummaryCardsProps {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
}


export default function SummaryCards({ totalIncome, totalExpenses, balance }: SummaryCardsProps) {
  const { user: firebaseUser } = useAuth();
  const [currencySymbol, setCurrencySymbol] = useState(appConfig.defaultCurrencySymbol);

  useEffect(() => {
    if (firebaseUser) {
      const fetchUserProfile = async () => {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data() as AppUser;
          if (userData.country && userData.country.currencySymbol) {
            setCurrencySymbol(userData.country.currencySymbol);
          } else {
            setCurrencySymbol(appConfig.defaultCurrencySymbol); // Fallback if country is set but symbol is not
          }
        } else {
           setCurrencySymbol(appConfig.defaultCurrencySymbol); // Fallback if user profile doesn't exist
        }
      };
      fetchUserProfile();
    } else {
        setCurrencySymbol(appConfig.defaultCurrencySymbol); // Fallback if no user
    }
  }, [firebaseUser]);
  
  const cardData = [
    { title: 'Total Income', value: totalIncome, icon: TrendingUp, color: 'text-green-500 dark:text-green-400' },
    { title: 'Total Expenses', value: totalExpenses, icon: TrendingDown, color: 'text-red-500 dark:text-red-400' },
    { title: 'Current Balance', value: balance, icon: Wallet, color: balance >= 0 ? 'text-blue-500 dark:text-blue-400' : 'text-orange-500 dark:text-orange-400' },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {cardData.map((card) => (
        <Card key={card.title} className="shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground font-body">{card.title}</CardTitle>
            <card.icon className={`h-5 w-5 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-headline text-foreground">
              {formatCurrency(card.value, currencySymbol)}
            </div>
            {/* <p className="text-xs text-muted-foreground">+20.1% from last month</p> */}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

