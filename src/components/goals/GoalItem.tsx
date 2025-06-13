
"use client";

import React from 'react';
import Link from 'next/link';
import { FinancialGoal } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Edit, Trash2, CalendarDays } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { getLucideIcon } from '@/lib/icons'; // To render optional icon

interface GoalItemProps {
  goal: FinancialGoal;
  currencySymbol: string;
  onDelete: (goal: FinancialGoal) => void;
}

export default function GoalItem({ goal, currencySymbol, onDelete }: GoalItemProps) {
  const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
  const GoalIcon = getLucideIcon(goal.icon, 'Target'); // Default to Target if no icon

  return (
    <Card className="shadow-md flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-md">
                 <GoalIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
                <CardTitle className="font-headline text-lg">{goal.goalName}</CardTitle>
                {goal.targetDate && (
                <CardDescription className="text-xs flex items-center">
                    <CalendarDays className="mr-1 h-3 w-3" />
                    Target: {formatDate(goal.targetDate, { month: 'short', year: 'numeric', day: 'numeric' })}
                </CardDescription>
                )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        {goal.description && <p className="text-sm text-muted-foreground mb-3">{goal.description}</p>}
        <div className="mb-1">
          <Progress value={progress} className="h-2.5" />
        </div>
        <div className="flex justify-between text-sm font-medium text-foreground">
          <span>{formatCurrency(goal.currentAmount, currencySymbol)}</span>
          <span className="text-muted-foreground">of {formatCurrency(goal.targetAmount, currencySymbol)}</span>
        </div>
        <p className="text-xs text-muted-foreground text-right mt-0.5">{progress.toFixed(1)}% Achieved</p>
      </CardContent>
      <CardFooter className="border-t pt-4 flex justify-end gap-2">
        <Button variant="ghost" size="icon" asChild className="text-muted-foreground hover:text-primary">
          <Link href={`/goals/edit/${goal.id}`}>
            <Edit className="h-4 w-4" />
            <span className="sr-only">Edit Goal</span>
          </Link>
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onDelete(goal)} className="text-muted-foreground hover:text-destructive">
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete Goal</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
