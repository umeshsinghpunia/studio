
"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { PlusCircle, ShieldCheck, AlertTriangle, Trash2, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase/config';
import { collection, query, where, onSnapshot, orderBy, doc, deleteDoc } from 'firebase/firestore';
import type { FinancialCard } from '@/types';
import FinancialCardItem from '@/components/cards/FinancialCardItem';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';

export default function CardsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [cards, setCards] = useState<FinancialCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cardToDelete, setCardToDelete] = useState<FinancialCard | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const cardsCol = collection(db, 'users', user.uid, 'financialCards');
    const q = query(cardsCol, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedCards: FinancialCard[] = [];
      snapshot.forEach((doc) => {
        fetchedCards.push({ id: doc.id, ...doc.data() } as FinancialCard);
      });
      setCards(fetchedCards);
      setLoading(false);
      setError(null);
    }, (err) => {
      console.error("Error fetching cards:", err);
      setError("Failed to load cards. Please try again later.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleDeleteInitiate = (card: FinancialCard) => {
    setCardToDelete(card);
    setIsAlertOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!cardToDelete || !user) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'financialCards', cardToDelete.id));
      toast({
        title: "Card Deleted",
        description: "The card has been successfully removed.",
      });
    } catch (error) {
      console.error("Error deleting card:", error);
      toast({
        title: "Error Deleting Card",
        description: "Could not delete the card. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAlertOpen(false);
      setCardToDelete(null);
      setIsDeleting(false);
    }
  };

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
        <p className="text-lg font-semibold">Error Loading Cards</p>
        <p>{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  return (
    <>
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-headline font-semibold md:text-3xl">Manage Your Cards</h1>
        <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Link href="/cards/add">
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Card
          </Link>
        </Button>
      </div>

      {cards.length === 0 ? (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-primary" />
              <CardTitle className="font-headline">Your Financial Cards</CardTitle>
            </div>
            <CardDescription>Keep track of your credit and debit cards securely.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
              <ShieldCheck className="h-16 w-16 text-muted-foreground/50" />
              <p className="text-lg font-medium text-muted-foreground">
                No cards added yet.
              </p>
              <p className="text-sm text-muted-foreground max-w-md">
                Add your financial cards to keep them organized. Click "Add New Card" to start.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <FinancialCardItem key={card.id} card={card} onDelete={handleDeleteInitiate} />
          ))}
        </div>
      )}
    </div>
    <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the card:
              <br />
              <strong>{cardToDelete?.cardName} (**** {cardToDelete?.lastFourDigits})</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {isDeleting ? <LoadingSpinner size={16} className="mr-2"/> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
