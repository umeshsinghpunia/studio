
import TransactionForm from '@/components/transactions/TransactionForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AddTransactionPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 items-center">
      <div className="w-full max-w-2xl">
        <h1 className="text-2xl font-headline font-semibold md:text-3xl mb-6 text-center sm:text-left">Add New Transaction</h1>
        <Card className="shadow-lg">
           <CardHeader>
            <CardTitle className="font-headline">Transaction Details</CardTitle>
            <CardDescription>Fill in the form below to record a new income or expense.</CardDescription>
          </CardHeader>
          <CardContent>
            <TransactionForm mode="add" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
