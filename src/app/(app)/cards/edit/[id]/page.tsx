
"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import CardForm from '@/components/cards/CardForm';
import LoadingSpinner from '@/components/LoadingSpinner';
import { AlertTriangle } from 'lucide-react';
import type { FinancialCard } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function EditCardPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [financialCard, setFinancialCard] = useState<FinancialCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cardId = typeof params.id === 'string' ? params.id : null;

  useEffect(() => {
    if (!user || !cardId) {
      if (!user && !loading) router.push('/login');
      if (!cardId && !loading) setError("Card ID is missing.");
      setLoading(false);
      return;
    }

    const fetchCard = async () => {
      setLoading(true);
      try {
        const cardRef = doc(db, 'users', user.uid, 'financialCards', cardId);
        const cardSnap = await getDoc(cardRef);

        if (cardSnap.exists()) {
          setFinancialCard({ id: cardSnap.id, ...cardSnap.data() } as FinancialCard);
          setError(null);
        } else {
          setError("Card not found.");
        }
      } catch (err) {
        console.error("Error fetching card:", err);
        setError("Failed to load card details.");
      } finally {
        setLoading(false);
      }
    };

    fetchCard();
  }, [user, cardId, router, loading]);

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
        <Button onClick={() => router.push('/cards')}>Back to Cards</Button>
      </div>
    );
  }

  if (!financialCard) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <p>Card data is unavailable.</p>
         <Button onClick={() => router.push('/cards')}>Back to Cards</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 items-center">
      <div className="w-full max-w-2xl">
        <h1 className="text-2xl font-headline font-semibold md:text-3xl mb-6 text-center sm:text-left">Edit Financial Card</h1>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline">Update Card Details</CardTitle>
            <CardDescription>Modify the details of your financial card.</CardDescription>
          </CardHeader>
          <CardContent>
            <CardForm mode="edit" financialCard={financialCard} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
