
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import TransactionForm from '@/components/transactions/TransactionForm';
import LoadingSpinner from '@/components/LoadingSpinner';
import { AlertTriangle } from 'lucide-react';
import type { Transaction } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function EditTransactionPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const transactionId = typeof params.id === 'string' ? params.id : null;

  useEffect(() => {
    if (!user || !transactionId) {
      if (!user && !loading) router.push('/login'); // Redirect if not logged in and auth check is done
      if (!transactionId && !loading) setError("Transaction ID is missing.");
      setLoading(false);
      return;
    }

    const fetchTransaction = async () => {
      setLoading(true);
      try {
        const transactionRef = doc(db, 'users', user.uid, 'transactions', transactionId);
        const transactionSnap = await getDoc(transactionRef);

        if (transactionSnap.exists()) {
          setTransaction({ id: transactionSnap.id, ...transactionSnap.data() } as Transaction);
          setError(null);
        } else {
          setError("Transaction not found.");
        }
      } catch (err) {
        console.error("Error fetching transaction:", err);
        setError("Failed to load transaction details.");
      } finally {
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [user, transactionId, router, loading]); // Added loading to dependencies

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
        <p className="text-lg font-semibold">Error</p>
        <p>{error}</p>
        <Button onClick={() => router.push('/transactions')}>Back to Transactions</Button>
      </div>
    );
  }

  if (!transaction) {
    // Should be caught by error state, but as a fallback
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <p>Transaction data is unavailable.</p>
         <Button onClick={() => router.push('/transactions')}>Back to Transactions</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 items-center">
      <div className="w-full max-w-2xl">
        <h1 className="text-2xl font-headline font-semibold md:text-3xl mb-6 text-center sm:text-left">Edit Transaction</h1>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline">Update Transaction Details</CardTitle>
            <CardDescription>Modify the details of your income or expense.</CardDescription>
          </CardHeader>
          <CardContent>
            <TransactionForm mode="edit" transaction={transaction} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
