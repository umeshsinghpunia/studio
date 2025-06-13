
import GoalForm from '@/components/goals/GoalForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AddGoalPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 items-center">
      <div className="w-full max-w-2xl">
        <h1 className="text-2xl font-headline font-semibold md:text-3xl mb-6 text-center sm:text-left">Add New Financial Goal</h1>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline">Goal Details</CardTitle>
            <CardDescription>Fill in the form below to add a new financial goal.</CardDescription>
          </CardHeader>
          <CardContent>
            <GoalForm mode="add" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
