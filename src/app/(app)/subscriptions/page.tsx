
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CreditCard, PlusCircle } from 'lucide-react';

export default function SubscriptionsPage() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-headline font-semibold md:text-3xl">Manage Subscriptions</h1>
        <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Link href="/subscriptions/add">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Subscription
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-primary" />
            <CardTitle className="font-headline">Your Subscriptions</CardTitle>
          </div>
          <CardDescription>Keep track of all your recurring subscriptions.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
            <CreditCard className="h-16 w-16 text-muted-foreground/50" />
            <p className="text-lg font-medium text-muted-foreground">
              Subscription tracking is coming soon!
            </p>
            <p className="text-sm text-muted-foreground max-w-md">
              This section will allow you to add, view, and manage all your active subscriptions, get reminders for upcoming payments, and analyze your subscription spending. Click "Add Subscription" to start.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
