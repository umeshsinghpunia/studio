
import CardForm from '@/components/cards/CardForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AddCardPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 items-center">
      <div className="w-full max-w-2xl">
        <h1 className="text-2xl font-headline font-semibold md:text-3xl mb-6 text-center sm:text-left">Add New Financial Card</h1>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline">Card Details</CardTitle>
            <CardDescription>Fill in the form below to add a new card.</CardDescription>
          </CardHeader>
          <CardContent>
            <CardForm mode="add" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
