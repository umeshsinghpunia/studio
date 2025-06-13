
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

export default function InsightPage() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-headline font-semibold md:text-3xl">Financial Insights</h1>
        {/* Add any relevant action buttons here if needed in the future */}
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            <CardTitle className="font-headline">Unlock Your Financial Insights</CardTitle>
          </div>
          <CardDescription>Deep dive into your spending habits and financial health.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
            <BarChart3 className="h-16 w-16 text-muted-foreground/50" />
            <p className="text-lg font-medium text-muted-foreground">
              Advanced Insights Coming Soon!
            </p>
            <p className="text-sm text-muted-foreground max-w-md">
              As a Pro user, you'll soon get access to AI-powered financial advice, personalized spending breakdowns, and actionable insights to help you achieve your financial goals faster.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
