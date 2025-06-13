
"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import GoalForm from '@/components/goals/GoalForm';
import LoadingSpinner from '@/components/LoadingSpinner';
import { AlertTriangle } from 'lucide-react';
import type { FinancialGoal } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function EditGoalPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [financialGoal, setFinancialGoal] = useState<FinancialGoal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const goalId = typeof params.id === 'string' ? params.id : null;

  useEffect(() => {
    if (!user || !goalId) {
      if (!user && !loading) router.push('/login');
      if (!goalId && !loading) setError("Goal ID is missing.");
      setLoading(false);
      return;
    }

    const fetchGoal = async () => {
      setLoading(true);
      try {
        const goalRef = doc(db, 'users', user.uid, 'financialGoals', goalId);
        const goalSnap = await getDoc(goalRef);

        if (goalSnap.exists()) {
          const goalData = goalSnap.data();
          // Ensure targetDate is parsed correctly if it exists
          setFinancialGoal({ 
            id: goalSnap.id, 
            ...goalData,
            targetDate: goalData.targetDate ? goalData.targetDate : undefined,
           } as FinancialGoal);
          setError(null);
        } else {
          setError("Goal not found.");
        }
      } catch (err) {
        console.error("Error fetching goal:", err);
        setError("Failed to load goal details.");
      } finally {
        setLoading(false);
      }
    };

    fetchGoal();
  }, [user, goalId, router, loading]);

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
        <Button onClick={() => router.push('/goals')}>Back to Goals</Button>
      </div>
    );
  }

  if (!financialGoal) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <p>Goal data is unavailable.</p>
         <Button onClick={() => router.push('/goals')}>Back to Goals</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 items-center">
      <div className="w-full max-w-2xl">
        <h1 className="text-2xl font-headline font-semibold md:text-3xl mb-6 text-center sm:text-left">Edit Financial Goal</h1>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline">Update Goal Details</CardTitle>
            <CardDescription>Modify the details of your financial goal.</CardDescription>
          </CardHeader>
          <CardContent>
            <GoalForm mode="edit" financialGoal={financialGoal} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
