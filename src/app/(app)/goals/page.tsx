
"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { PlusCircle, Target, AlertTriangle, Trash2, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase/config';
import { collection, query, onSnapshot, orderBy, doc, deleteDoc } from 'firebase/firestore';
import type { FinancialGoal } from '@/types';
import GoalItem from '@/components/goals/GoalItem';
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
import { appConfig } from '@/config/app';
import type { AppUser } from '@/types';
import { getCountryByCode } from '@/lib/countries';

export default function GoalsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [goalToDelete, setGoalToDelete] = useState<FinancialGoal | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currencySymbol, setCurrencySymbol] = useState(appConfig.defaultCurrencySymbol);

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
          }
        }
      };
      fetchUserProfile();
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const goalsCol = collection(db, 'users', user.uid, 'financialGoals');
    const q = query(goalsCol, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedGoals: FinancialGoal[] = [];
      snapshot.forEach((doc) => {
        fetchedGoals.push({ id: doc.id, ...doc.data() } as FinancialGoal);
      });
      setGoals(fetchedGoals);
      setLoading(false);
      setError(null);
    }, (err) => {
      console.error("Error fetching goals:", err);
      setError("Failed to load goals. Please try again later.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleDeleteInitiate = (goal: FinancialGoal) => {
    setGoalToDelete(goal);
    setIsAlertOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!goalToDelete || !user) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'financialGoals', goalToDelete.id));
      toast({
        title: "Goal Deleted",
        description: "The goal has been successfully removed.",
      });
    } catch (error) {
      console.error("Error deleting goal:", error);
      toast({
        title: "Error Deleting Goal",
        description: "Could not delete the goal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAlertOpen(false);
      setGoalToDelete(null);
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
        <p className="text-lg font-semibold">Error Loading Goals</p>
        <p>{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  return (
    <>
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-headline font-semibold md:text-3xl">Track Your Goals</h1>
        <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Link href="/goals/add">
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Goal
          </Link>
        </Button>
      </div>

      {goals.length === 0 ? (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="h-6 w-6 text-primary" />
              <CardTitle className="font-headline">Your Financial Goals</CardTitle>
            </div>
            <CardDescription>Set, track, and achieve your financial aspirations.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
              <Target className="h-16 w-16 text-muted-foreground/50" />
              <p className="text-lg font-medium text-muted-foreground">
                No goals set yet.
              </p>
              <p className="text-sm text-muted-foreground max-w-md">
                Define your financial targets and monitor your progress. Click "Add New Goal" to start.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => (
            <GoalItem key={goal.id} goal={goal} currencySymbol={currencySymbol} onDelete={handleDeleteInitiate} />
          ))}
        </div>
      )}
    </div>
    <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the goal:
              <br />
              <strong>{goalToDelete?.goalName}</strong>
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
