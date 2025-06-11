
import BillForm from '@/components/bills/BillForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AddBillPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 items-center">
      <div className="w-full max-w-2xl">
        <h1 className="text-2xl font-headline font-semibold md:text-3xl mb-6 text-center sm:text-left">Add New Bill</h1>
        <Card className="shadow-lg">
           <CardHeader>
            <CardTitle className="font-headline">Bill Details</CardTitle>
            <CardDescription>Fill in the form below to record a new bill.</CardDescription>
          </CardHeader>
          <CardContent>
            <BillForm mode="add" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
