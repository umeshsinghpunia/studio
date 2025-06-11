
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Receipt } from 'lucide-react';

export default function BillsPage() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <h1 className="text-2xl font-headline font-semibold md:text-3xl">Track Bills</h1>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Receipt className="h-6 w-6 text-primary" />
            <CardTitle className="font-headline">Your Bills</CardTitle>
          </div>
          <CardDescription>Stay on top of your upcoming and paid bills.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
            <Receipt className="h-16 w-16 text-muted-foreground/50" />
            <p className="text-lg font-medium text-muted-foreground">
              Bill tracking feature is under development.
            </p>
            <p className="text-sm text-muted-foreground max-w-md">
              Soon, you'll be able to manage all your bills, set payment reminders, mark bills as paid, and see an overview of your bill payments.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
