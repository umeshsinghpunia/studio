
"use client";

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase/config';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import type { Transaction } from '@/types';
import SummaryCards from '@/components/dashboard/SummaryCards';
import SpendingChart from '@/components/dashboard/SpendingChart';
import TransactionListPreview from '@/components/dashboard/TransactionListPreview';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle, AlertTriangle } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    };

    setLoading(true);
    const transactionsCol = collection(db, 'users', user.uid, 'transactions');
    const q = query(transactionsCol, orderBy('date', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedTransactions: Transaction[] = [];
      snapshot.forEach((doc) => {
        fetchedTransactions.push({ id: doc.id, ...doc.data() } as Transaction);
      });
      setTransactions(fetchedTransactions);
      setLoading(false);
      setError(null);
    }, (err) => {
      console.error("Detailed error fetching transactions from Firestore: ", err);
      console.log("Firebase error code (if available):", (err as any)?.code);
      console.log("Firebase error message (if available):", (err as any)?.message);
      setError("Failed to load transactions. Please check the browser console for more details and try again later.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const summaryData = useMemo(() => {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const balance = totalIncome - totalExpenses;
    return { totalIncome, totalExpenses, balance };
  }, [transactions]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <LoadingSpinner size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-destructive">
        <AlertTriangle size={48} />
        <p className="text-lg font-semibold">Error Loading Dashboard</p>
        <p>{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }
  
  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-headline font-semibold md:text-3xl">Dashboard</h1>
        <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Link href="/transactions/add">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Transaction
          </Link>
        </Button>
      </div>

      <SummaryCards
        totalIncome={summaryData.totalIncome}
        totalExpenses={summaryData.totalExpenses}
        balance={summaryData.balance}
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="md:col-span-2 lg:col-span-7">
          <CardHeader>
            <CardTitle className="font-headline">Monthly Spending</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            {transactions.filter(t => t.type === 'expense').length > 0 ? (
              <SpendingChart transactions={transactions} />
            ) : (
              <p className="text-muted-foreground text-center py-8">No spending data available yet. Add some expenses to see your chart!</p>
            )}
          </CardContent>
        </Card>
         <Card className="md:col-span-2 lg:col-span-7">
          <CardHeader>
            <CardTitle className="font-headline">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <TransactionListPreview transactions={recentTransactions} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
