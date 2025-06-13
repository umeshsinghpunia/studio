
"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase/config';
import { collection, query, onSnapshot, orderBy, doc, getDoc } from 'firebase/firestore';
import type { Transaction, AppUser } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/LoadingSpinner';
import { AlertTriangle, BarChart3, Lightbulb } from 'lucide-react';
import { generateFinancialInsights, type FinancialSummaryInput, type FinancialInsightsOutput } from '@/ai/flows/generate-financial-insights-flow';
import { appConfig } from '@/config/app';
import { getCountryByCode } from '@/lib/countries';

export default function InsightPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [insightsResult, setInsightsResult] = useState<FinancialInsightsOutput | null>(null);
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
      setLoadingTransactions(false);
      return;
    }

    setLoadingTransactions(true);
    const transactionsCol = collection(db, 'users', user.uid, 'transactions');
    const q = query(transactionsCol, orderBy('date', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedTransactions: Transaction[] = [];
      snapshot.forEach((doc) => {
        fetchedTransactions.push({ id: doc.id, ...doc.data() } as Transaction);
      });
      setTransactions(fetchedTransactions);
      setLoadingTransactions(false);
      setError(null);
    }, (err) => {
      console.error("Error fetching transactions:", err);
      setError("Failed to load transaction data for insights.");
      setLoadingTransactions(false);
    });

    return () => unsubscribe();
  }, [user]);

  const transactionSummary = useMemo((): FinancialSummaryInput | null => {
    if (transactions.length === 0) return null;

    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const expensesByCategory: { [key: string]: number } = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        expensesByCategory[t.category.name] = (expensesByCategory[t.category.name] || 0) + t.amount;
      });
    
    const topCategories = Object.entries(expensesByCategory)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([name, amount]) => ({ name, amount }));

    return { totalIncome, totalExpenses, topCategories, currencySymbol };
  }, [transactions, currencySymbol]);

  const handleGenerateInsights = async () => {
    if (!transactionSummary) {
      setError("Not enough transaction data to generate insights.");
      return;
    }
    setLoadingInsights(true);
    setError(null);
    setInsightsResult(null);
    try {
      const result = await generateFinancialInsights(transactionSummary);
      setInsightsResult(result);
    } catch (err) {
      console.error("Error generating insights:", err);
      setError("Could not generate financial insights at this time. Please try again later.");
    } finally {
      setLoadingInsights(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-headline font-semibold md:text-3xl">Financial Insights</h1>
      </div>
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            <CardTitle className="font-headline">Unlock Your Financial Insights</CardTitle>
          </div>
          <CardDescription>AI-powered advice based on your recent financial activity.</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingTransactions && (
            <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
              <LoadingSpinner size={32} />
              <p className="text-muted-foreground">Loading transaction data...</p>
            </div>
          )}

          {!loadingTransactions && error && (
            <div className="flex flex-col items-center justify-center gap-4 py-12 text-center text-destructive">
              <AlertTriangle size={48} />
              <p className="text-lg font-semibold">Error</p>
              <p>{error}</p>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </div>
          )}

          {!loadingTransactions && !error && (
            <>
              {insightsResult ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1 flex items-center">
                      <Lightbulb className="h-5 w-5 mr-2 text-yellow-400" />
                      Overall Assessment
                    </h3>
                    <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">{insightsResult.overallAssessment}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center">
                        <Lightbulb className="h-5 w-5 mr-2 text-yellow-400" />
                        Personalized Tips
                    </h3>
                    <ul className="space-y-2 list-disc list-inside pl-1">
                      {insightsResult.insights.map((insight, index) => (
                        <li key={index} className="text-sm text-muted-foreground">
                            <span className="bg-primary/10 text-primary font-medium px-1.5 py-0.5 rounded-sm mr-1.5">{index + 1}</span>
                            {insight}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button onClick={handleGenerateInsights} disabled={loadingInsights} className="mt-6">
                    {loadingInsights && <LoadingSpinner size={20} className="mr-2" />}
                    Refresh Insights
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
                  <BarChart3 className="h-16 w-16 text-muted-foreground/50" />
                  <p className="text-lg font-medium text-muted-foreground">
                    Ready for some financial clarity?
                  </p>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Click the button below to generate personalized insights based on your transaction history. This Pro feature helps you understand your spending and find opportunities to save.
                  </p>
                  <Button onClick={handleGenerateInsights} disabled={loadingInsights || transactions.length === 0} className="mt-4">
                    {loadingInsights && <LoadingSpinner size={20} className="mr-2" />}
                    {transactions.length === 0 && !loadingTransactions ? "Add Transactions to Get Insights" : "Generate Insights"}
                  </Button>
                </div>
              )}
            </>
          )}
           {loadingInsights && !insightsResult && (
             <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
                <LoadingSpinner size={32} />
                <p className="text-muted-foreground">Generating your financial insights... This may take a moment.</p>
             </div>
            )}

        </CardContent>
      </Card>
    </div>
  );
}
