
"use client";

import type { Transaction } from '@/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { formatCurrency, cn, formatDate } from '@/lib/utils';
import { ArrowRight, ListChecks } from 'lucide-react';
// import { getLucideIcon } from '@/lib/icons'; // Not used in Dribbble style rows
// import { useAuth } from '@/contexts/AuthContext'; // Currency symbol now passed as prop
// import { doc, getDoc } from 'firebase/firestore'; // Currency symbol now passed as prop
// import { db } from '@/lib/firebase/config'; // Currency symbol now passed as prop
// import type { AppUser } from '@/types'; // Currency symbol now passed as prop
// import { appConfig } from '@/config/app'; // Currency symbol now passed as prop
// import { getCountryByCode } from '@/lib/countries'; // Currency symbol now passed as prop
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';


interface TransactionListPreviewProps {
  transactions: Transaction[];
  currencySymbol: string;
}

export default function TransactionListPreview({ transactions, currencySymbol }: TransactionListPreviewProps) {

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <ListChecks className="mx-auto h-12 w-12 mb-2" />
        <p>No recent transactions yet.</p>
        <Button variant="link" asChild className="mt-2 text-primary">
          <Link href="/transactions/add">Add your first transaction</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-0">
        <Table className="text-xs">
          <TableHeader className="[&_tr]:border-b-0">
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-8 px-3 text-muted-foreground font-medium">S.N</TableHead>
              <TableHead className="h-8 px-3 text-muted-foreground font-medium">Amount</TableHead>
              <TableHead className="h-8 px-3 text-muted-foreground font-medium">Category</TableHead>
              <TableHead className="h-8 px-3 text-muted-foreground font-medium hidden sm:table-cell">Sub Category</TableHead>
              <TableHead className="h-8 px-3 text-muted-foreground font-medium">Date</TableHead>
              <TableHead className="h-8 px-3 text-muted-foreground font-medium hidden md:table-cell">Mode</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction, index) => (
              <TableRow key={transaction.id} className="border-b-0 last:border-b-0 hover:bg-muted/30">
                <TableCell className="py-2 px-3 text-muted-foreground">{index + 1}.</TableCell>
                <TableCell className={cn(
                  "py-2 px-3 font-medium",
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                )}>
                  {transaction.type === 'income' ? '+' : '-'}
                  {formatCurrency(transaction.amount, currencySymbol)}
                </TableCell>
                <TableCell className="py-2 px-3 text-foreground">{transaction.category.name}</TableCell>
                <TableCell className="py-2 px-3 text-muted-foreground hidden sm:table-cell">{transaction.notes?.split(' ')[0] || 'N/A'}</TableCell>
                <TableCell className="py-2 px-3 text-muted-foreground">{formatDate(transaction.date, {day: '2-digit', month: 'short', year: 'numeric'})}</TableCell>
                <TableCell className="py-2 px-3 text-muted-foreground hidden md:table-cell">UPI</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      {transactions.length > 0 && (
         <div className="px-3 pt-1 pb-2">
            <Button variant="link" className="w-full text-primary justify-start p-0 h-auto text-xs" asChild>
                <Link href="/transactions">
                    View All Transactions <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
            </Button>
         </div>
      )}
    </div>
  );
}
