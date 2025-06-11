
"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase/config';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import type { Transaction } from '@/types';
import TransactionList from '@/components/transactions/TransactionList';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle, AlertTriangle } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function TransactionsPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const transactionsCol = collection(db, 'users', user.uid, 'transactions');
    // Order by date descending to show newest first
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
      console.error("Error fetching transactions:", err);
      setError("Failed to load transactions. Please try again later.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

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
        <p className="text-lg font-semibold">Error Loading Transactions</p>
        <p>{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-headline font-semibold md:text-3xl">All Transactions</h1>
        <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Link href="/transactions/add">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Transaction
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Transaction History</CardTitle>
          <CardDescription>View and manage all your recorded income and expenses.</CardDescription>
        </CardHeader>
        <CardContent>
          <TransactionList transactions={transactions} />
        </CardContent>
      </Card>
    </div>
  );
}
