
"use client";

import type { Transaction } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { formatCurrency, cn, formatDate } from '@/lib/utils';
import { ArrowRight, ListChecks } from 'lucide-react';
import { getLucideIcon } from '@/lib/icons'; 
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { AppUser } from '@/types';
import { appConfig } from '@/config/app';


interface TransactionListPreviewProps {
  transactions: Transaction[];
}

export default function TransactionListPreview({ transactions }: TransactionListPreviewProps) {
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
  }, [firebaseUser]);

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <ListChecks className="mx-auto h-12 w-12 mb-2" />
        <p>No recent transactions yet.</p>
        <Button variant="link" asChild className="mt-2 text-accent">
          <Link href="/transactions/add">Add your first transaction</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ScrollArea className="h-[300px]">
        <ul className="space-y-3 pr-3">
          {transactions.map((transaction) => {
            const Icon = getLucideIcon(transaction.category.icon);
            return (
              <li key={transaction.id} className="flex items-center justify-between p-3 bg-card rounded-lg shadow-sm border border-border hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-full">
                    {Icon ? <Icon className="h-5 w-5 text-primary" /> : <ListChecks className="h-5 w-5 text-primary" />}
                  </div>
                  <div>
                    <p className="font-medium text-sm text-foreground">{transaction.category.name}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(transaction.date)}</p>
                  </div>
                </div>
                <p className={cn(
                  "font-semibold text-sm",
                  transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-500'
                )}>
                  {transaction.type === 'income' ? '+' : '-'}
                  {formatCurrency(transaction.amount, currencySymbol)}
                </p>
              </li>
            );
          })}
        </ul>
      </ScrollArea>
      {transactions.length > 0 && (
         <Button variant="outline" className="w-full hover:bg-accent hover:text-accent-foreground" asChild>
            <Link href="/transactions">
                View All Transactions <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
        </Button>
      )}
    </div>
  );
}

