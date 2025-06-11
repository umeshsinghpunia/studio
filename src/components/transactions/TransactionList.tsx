
"use client";

import type { Transaction, AppUser } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, AlertTriangle } from 'lucide-react';
import { formatCurrency, cn, formatDate } from '@/lib/utils';
import { getLucideIcon } from '@/lib/icons';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import LoadingSpinner from '../LoadingSpinner';

interface TransactionListProps {
  transactions: Transaction[];
}

export default function TransactionList({ transactions }: TransactionListProps) {
  const { user: firebaseUser } = useAuth();
  const { toast } = useToast();
  const [currencySymbol, setCurrencySymbol] = useState('$');
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (firebaseUser) {
      const fetchUserProfile = async () => {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data() as AppUser;
          if (userData.country && userData.country.currencySymbol) {
            setCurrencySymbol(userData.country.currencySymbol);
          }
        }
      };
      fetchUserProfile();
    }
  }, [firebaseUser]);

  const handleDeleteInitiate = (transaction: Transaction) => {
    setTransactionToDelete(transaction);
    setIsAlertOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!transactionToDelete || !firebaseUser) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'users', firebaseUser.uid, 'transactions', transactionToDelete.id));
      toast({
        title: "Transaction Deleted",
        description: "The transaction has been successfully removed.",
      });
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast({
        title: "Error Deleting Transaction",
        description: "Could not delete the transaction. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAlertOpen(false);
      setTransactionToDelete(null);
      setIsDeleting(false);
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        <p className="mb-2 text-lg">No transactions found.</p>
        <p>Start by adding your income or expenses.</p>
        <Button asChild variant="link" className="mt-4 text-accent">
          <Link href="/transactions/add">Add New Transaction</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px] hidden sm:table-cell">Icon</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="hidden md:table-cell">Type</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="hidden lg:table-cell">Notes</TableHead>
              <TableHead className="text-right w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => {
              const Icon = getLucideIcon(transaction.category.icon);
              return (
                <TableRow key={transaction.id}>
                  <TableCell className="hidden sm:table-cell">
                    <div className="flex items-center justify-center p-2 bg-primary/10 dark:bg-primary/20 rounded-full w-9 h-9">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{transaction.category.name}</TableCell>
                  <TableCell>{formatDate(transaction.date)}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full text-xs font-semibold",
                        transaction.type === 'income'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400'
                      )}
                    >
                      {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-semibold",
                      transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-500'
                    )}
                  >
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount, currencySymbol)}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell max-w-[200px] truncate text-muted-foreground">
                    {transaction.notes || '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" asChild className="hover:text-accent">
                      <Link href={`/transactions/edit/${transaction.id}`}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteInitiate(transaction)} className="hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the transaction:
              <br />
              <strong>{transactionToDelete?.category.name} - {transactionToDelete ? formatCurrency(transactionToDelete.amount, currencySymbol) : ''}</strong>
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

