
"use client";

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase/config';
import { collection, query, where, onSnapshot, orderBy, getDocs, Timestamp, doc, getDoc, limit } from 'firebase/firestore';
import type { Transaction, Investment, FinancialGoal } from '@/types';
// import SummaryCards from '@/components/dashboard/SummaryCards'; // To be replaced
import SpendingChart from '@/components/dashboard/SpendingChart';
import TransactionListPreview from '@/components/dashboard/TransactionListPreview';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { PlusCircle, AlertTriangle, MoreHorizontal, Banknote, TrendingDown as TrendingDownIcon, TrendingUp as TrendingUpIcon, Target, CreditCard, ListFilter, CalendarDays, Briefcase } from 'lucide-react'; // Renamed to avoid conflict
import LoadingSpinner from '@/components/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { appConfig } from '@/config/app'; // For default currency symbol
import { getCountryByCode } from '@/lib/countries';
import type { AppUser } from '@/types';
import { Progress } from "@/components/ui/progress"

const SummaryCard = ({ title, value, icon: Icon, trend, trendText, currencySymbol,bgColorClass = 'bg-primary/10', iconColorClass = 'text-primary', isLoading }: { title: string, value: number, icon: React.ElementType, trend?: string, trendText?: string, currencySymbol: string, bgColorClass?: string, iconColorClass?: string, isLoading?: boolean}) => (
  <Card className="shadow-card">
    <CardHeader className="pb-2">
      <div className="flex items-center justify-between">
        <div className={`p-2 rounded-md ${bgColorClass}`}>
          <Icon className={`h-5 w-5 ${iconColorClass}`} />
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </CardHeader>
    <CardContent>
      <p className="text-xs text-muted-foreground mb-1">{title}</p>
      {isLoading ? (
         <div className="h-[28px] flex items-center"> <LoadingSpinner size={20}/> </div>
      ) : (
        <h3 className="text-2xl font-bold font-headline text-foreground mb-1">
            {formatCurrency(value, currencySymbol)}
        </h3>
      )}
      {trend && trendText && !isLoading && (
        <p className={`text-xs ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
          {trend === 'up' ? '▲' : '▼'} {trendText}
        </p>
      )}
    </CardContent>
  </Card>
);

const GoalCard = ({ goal, currencySymbol, isLoading }: { goal: FinancialGoal | null, currencySymbol: string, isLoading?: boolean}) => {
  if (isLoading) {
    return (
      <Card className="shadow-card flex items-center justify-center min-h-[150px]">
        <LoadingSpinner size={28}/>
      </Card>
    );
  }

  if (!goal) {
    return (
       <Card className="shadow-card">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-md bg-yellow-400/10">
                <Target className="h-5 w-5 text-yellow-500" />
            </div>
             <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
            <p className="text-md font-semibold text-foreground mb-1">No Active Goal</p>
            <p className="text-xs text-muted-foreground mb-3">Set a financial goal to track your progress towards achieving it.</p>
            <Button asChild size="sm" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                <Link href="/goals/add">
                    <PlusCircle className="mr-2 h-4 w-4" /> Set a New Goal
                </Link>
            </Button>
        </CardContent>
    </Card>
    );
  }

  const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
  return (
    <Card className="shadow-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
         <div className="p-2 rounded-md bg-yellow-400/10">
            <Target className="h-5 w-5 text-yellow-500" />
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground mb-1">Active Goal</p>
        <h3 className="text-md font-semibold text-foreground mb-1 truncate" title={goal.goalName}>{goal.goalName}</h3>
        <Progress value={progress} className="w-full h-2 my-2" />
        <div className="flex justify-between text-xs text-muted-foreground">
            <span>Collected: {formatCurrency(goal.currentAmount, currencySymbol)}</span>
            <span>Required: {formatCurrency(goal.targetAmount, currencySymbol)}</span>
        </div>
      </CardContent>
    </Card>
  );
};


const BillSubscriptionItem = ({ name, date, amount, iconUrl, currencySymbol, dataAiHint }: { name: string, date: string, amount: number, iconUrl?: string, currencySymbol: string, dataAiHint?: string }) => (
    <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-3">
            {iconUrl ? <Image src={iconUrl} alt={name} width={32} height={32} className="rounded-full" data-ai-hint={dataAiHint || "logo company"} /> : <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center"><CreditCard className="h-4 w-4 text-muted-foreground"/></div> }
            <div>
                <p className="text-sm font-medium text-foreground">{name}</p>
                <p className="text-xs text-muted-foreground">{date}</p>
            </div>
        </div>
        <p className="text-sm font-semibold text-foreground">{formatCurrency(amount, currencySymbol)}</p>
    </div>
);


export default function DashboardPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [errorTransactions, setErrorTransactions] = useState<string | null>(null);
  
  const [totalInvestmentValue, setTotalInvestmentValue] = useState(0);
  const [loadingInvestments, setLoadingInvestments] = useState(true);
  const [errorInvestments, setErrorInvestments] = useState<string | null>(null);

  const [dashboardGoal, setDashboardGoal] = useState<FinancialGoal | null>(null);
  const [loadingGoal, setLoadingGoal] = useState(true);
  const [errorGoal, setErrorGoal] = useState<string | null>(null);
  
  const [currencySymbol, setCurrencySymbol] = useState(appConfig.defaultCurrencySymbol);
  const [userProfile, setUserProfile] = useState<AppUser | null>(null);

  useEffect(() => {
    if (user) {
      setLoadingTransactions(true);
      setLoadingInvestments(true);
      setLoadingGoal(true);

      const fetchUserProfile = async () => {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data() as AppUser;
          setUserProfile(userData);
          if (userData.country) {
             const countryDetails = getCountryByCode(userData.country.code);
             if (countryDetails?.currencySymbol) {
                setCurrencySymbol(countryDetails.currencySymbol);
             } else if (userData.country.currencySymbol) { // Check this if 'P' is coming from direct user data
                setCurrencySymbol(userData.country.currencySymbol);
             } else {
                setCurrencySymbol(appConfig.defaultCurrencySymbol);
             }
          } else {
            setCurrencySymbol(appConfig.defaultCurrencySymbol);
          }
        } else {
          setCurrencySymbol(appConfig.defaultCurrencySymbol);
          console.log("User profile document does not exist for UID:", user.uid);
        }
      };
      fetchUserProfile();

      // Transactions listener
      const transactionsCol = collection(db, 'users', user.uid, 'transactions');
      const qTransactions = query(transactionsCol, orderBy('date', 'desc'));
      const unsubscribeTransactions = onSnapshot(qTransactions, (snapshot) => {
        const fetchedTransactions: Transaction[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          const transactionDate = data.date instanceof Timestamp ? data.date.toDate().toISOString() : data.date;
          fetchedTransactions.push({ id: doc.id, ...data, date: transactionDate } as Transaction);
        });
        setTransactions(fetchedTransactions);
        setLoadingTransactions(false);
        setErrorTransactions(null);
      }, (err) => {
        console.error("Error fetching transactions:", err);
        setErrorTransactions("Failed to load transactions.");
        setLoadingTransactions(false);
      });

      // Investments listener
      const investmentsCol = collection(db, 'users', user.uid, 'investments');
      const qInvestments = query(investmentsCol);
      const unsubscribeInvestments = onSnapshot(qInvestments, (snapshot) => {
        let totalVal = 0;
        snapshot.forEach((doc) => {
          const investment = doc.data() as Investment;
          totalVal += investment.currentValue || investment.amountInvested || 0;
        });
        setTotalInvestmentValue(totalVal);
        setLoadingInvestments(false);
        setErrorInvestments(null);
      }, (err) => {
        console.error("Error fetching investments:", err);
        setErrorInvestments("Failed to load investments.");
        setLoadingInvestments(false);
      });

      // Goals listener (latest one)
      const goalsCol = collection(db, 'users', user.uid, 'financialGoals');
      const qGoals = query(goalsCol, orderBy('createdAt', 'desc'), limit(1));
      const unsubscribeGoals = onSnapshot(qGoals, (snapshot) => {
        if (!snapshot.empty) {
          const goalDoc = snapshot.docs[0];
          setDashboardGoal({ id: goalDoc.id, ...goalDoc.data() } as FinancialGoal);
        } else {
          setDashboardGoal(null);
        }
        setLoadingGoal(false);
        setErrorGoal(null);
      }, (err) => {
        console.error("Error fetching goal:", err);
        setErrorGoal("Failed to load goal.");
        setLoadingGoal(false);
      });

      return () => {
        unsubscribeTransactions();
        unsubscribeInvestments();
        unsubscribeGoals();
      };

    } else {
      setCurrencySymbol(appConfig.defaultCurrencySymbol);
      setLoadingTransactions(false);
      setLoadingInvestments(false);
      setLoadingGoal(false);
    }
  }, [user]);


  const summaryData = useMemo(() => {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const balance = totalIncome - totalExpenses;
    const currentMonthExpenses = totalExpenses; 

    return { totalIncome, totalExpenses, balance, currentMonthExpenses };
  }, [transactions]);
  
  const recentTransactions = transactions.slice(0, 5);

  const overallLoading = loadingTransactions || loadingInvestments || loadingGoal; 

  if (overallLoading && transactions.length === 0) { 
    return (
      <div className="flex flex-1 items-center justify-center">
        <LoadingSpinner size={32} />
      </div>
    );
  }
  
  const anyError = errorTransactions || errorInvestments || errorGoal;
  if (anyError) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-destructive">
        <AlertTriangle size={48} />
        <p className="text-lg font-semibold">Error Loading Dashboard Data</p>
        <p>{errorTransactions || errorInvestments || errorGoal}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }


  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SummaryCard 
          title="Account Balance" 
          value={summaryData.balance} 
          icon={Banknote} 
          currencySymbol={currencySymbol}
          trend={summaryData.balance > 5000 ? "up" : "down"} 
          trendText="vs last month" 
          bgColorClass="bg-purple-500/10"
          iconColorClass="text-purple-600"
          isLoading={loadingTransactions}
        />
        <SummaryCard 
          title="Monthly Expenses" 
          value={summaryData.currentMonthExpenses} 
          icon={TrendingDownIcon} 
          currencySymbol={currencySymbol}
          trend="down"
          trendText="vs last month"
          bgColorClass="bg-red-500/10"
          iconColorClass="text-red-600"
          isLoading={loadingTransactions}
        />
        <SummaryCard 
            title="Total Investment" 
            value={totalInvestmentValue} 
            icon={Briefcase} 
            currencySymbol={currencySymbol}
            trend="up"
            bgColorClass="bg-indigo-500/10"
            iconColorClass="text-indigo-600"
            isLoading={loadingInvestments}
        />
        <GoalCard
            goal={dashboardGoal}
            currencySymbol={currencySymbol}
            isLoading={loadingGoal}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-1 lg:grid-cols-1">
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-headline text-lg">Monthly Expenses</CardTitle>
            <div className="flex items-center gap-2">
                <span className="text-xs text-green-600 bg-green-500/10 px-2 py-1 rounded-md">▲ 6% more than last month</span>
                <Button variant="outline" size="sm" className="h-8">
                    <CalendarDays className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                    Recent
                </Button>
                 <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </div>
          </CardHeader>
          <CardContent className="pl-2 pr-4 pb-4">
            {loadingTransactions && transactions.length === 0 ? (
                 <div className="h-[280px] flex items-center justify-center"><LoadingSpinner/></div>
            ) : transactions.filter(t => t.type === 'expense').length > 0 ? (
              <SpendingChart transactions={transactions} chartType="bar" currencySymbol={currencySymbol} />
            ) : (
              <p className="text-muted-foreground text-center py-8">No spending data available yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
         <Card className="lg:col-span-3 shadow-card"> 
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-headline text-lg">Top Category</CardTitle>
             <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-8">
                    <CalendarDays className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                    Recent
                </Button>
                 <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
             {loadingTransactions && transactions.length === 0 ? (
                <div className="h-[200px] flex items-center justify-center"><LoadingSpinner/></div>
             ) : transactions.filter(t => t.type === 'expense').length > 0 ? (
                <SpendingChart transactions={transactions} chartType="pie" currencySymbol={currencySymbol} />
              ) : (
                <p className="text-muted-foreground text-center py-8">No category data available.</p>
              )}
              <Button variant="link" className="w-full mt-2 text-primary justify-start pl-0">More Details...</Button>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-2 shadow-card"> 
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-headline text-lg">Bill & Subscription</CardTitle>
                 <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </CardHeader>
            <CardContent>
                <div className="space-y-1">
                    <BillSubscriptionItem name="Netflix" date="15 June 2025" amount={149} currencySymbol={currencySymbol} iconUrl="https://placehold.co/32x32.png" dataAiHint="logo netflix" />
                    <BillSubscriptionItem name="Spotify" date="24 Aug 2025" amount={49} currencySymbol={currencySymbol} iconUrl="https://placehold.co/32x32.png" dataAiHint="logo spotify" />
                    <BillSubscriptionItem name="Figma" date="01 Jan 2026" amount={3999} currencySymbol={currencySymbol} iconUrl="https://placehold.co/32x32.png" dataAiHint="logo figma" />
                    <BillSubscriptionItem name="WIFI" date="11 June 2025" amount={399} currencySymbol={currencySymbol} iconUrl="https://placehold.co/32x32.png" dataAiHint="logo wifi" />
                    <BillSubscriptionItem name="Electricity" date="31 June 2025" amount={1265} currencySymbol={currencySymbol} iconUrl="https://placehold.co/32x32.png" dataAiHint="logo electricity" />
                </div>
            </CardContent>
        </Card>
      </div>

       <div className="grid grid-cols-1 gap-6 md:grid-cols-1 lg:grid-cols-1"> 
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-headline text-lg">Recent Expenses</CardTitle>
            <div className="flex items-center gap-2">
                 <Button variant="outline" size="sm" className="h-8">
                    <ListFilter className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                    Filter
                </Button>
                <Button variant="outline" size="sm" className="h-8">
                    <CalendarDays className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                    Recent
                </Button>
                 <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loadingTransactions && transactions.length === 0 ? (
                 <div className="h-[150px] flex items-center justify-center"><LoadingSpinner/></div>
            ) : (
                <TransactionListPreview transactions={recentTransactions} currencySymbol={currencySymbol} />
            )}
          </CardContent>
        </Card>
      </div>
       <div className="mt-4 flex justify-end">
         <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Link href="/transactions/add">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Transaction
          </Link>
        </Button>
      </div>
    </div>
  );
}
