
import SubscriptionForm from '@/components/subscriptions/SubscriptionForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AddSubscriptionPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 items-center">
      <div className="w-full max-w-2xl">
        <h1 className="text-2xl font-headline font-semibold md:text-3xl mb-6 text-center sm:text-left">Add New Subscription</h1>
        <Card className="shadow-lg">
           <CardHeader>
            <CardTitle className="font-headline">Subscription Details</CardTitle>
            <CardDescription>Fill in the form below to record a new recurring subscription.</CardDescription>
          </CardHeader>
          <CardContent>
            <SubscriptionForm mode="add" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
