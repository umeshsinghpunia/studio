
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, FileText, BarChartHorizontalBig, Repeat } from 'lucide-react'; // Added more icons

export default function AnalyticsPage() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-headline font-semibold md:text-3xl">Advanced Analytics</h1>
      </div>
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <LineChart className="h-6 w-6 text-primary" />
            <CardTitle className="font-headline">Data-Driven Financial Analytics</CardTitle>
          </div>
          <CardDescription>Explore detailed analytics and forecasts for your finances. This Pro feature is under active development.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center gap-6 py-12 text-center">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="flex flex-col items-center gap-2 p-4 bg-muted/30 rounded-lg">
                    <FileText className="h-10 w-10 text-primary/70" />
                    <p className="text-xs font-medium text-muted-foreground">Custom Reports</p>
                </div>
                <div className="flex flex-col items-center gap-2 p-4 bg-muted/30 rounded-lg">
                    <LineChart className="h-10 w-10 text-primary/70" />
                    <p className="text-xs font-medium text-muted-foreground">Trend Visualization</p>
                </div>
                 <div className="flex flex-col items-center gap-2 p-4 bg-muted/30 rounded-lg">
                    <Repeat className="h-10 w-10 text-primary/70" />
                    <p className="text-xs font-medium text-muted-foreground">Scenario Comparison</p>
                </div>
                <div className="flex flex-col items-center gap-2 p-4 bg-muted/30 rounded-lg">
                    <BarChartHorizontalBig className="h-10 w-10 text-primary/70" />
                    <p className="text-xs font-medium text-muted-foreground">Predictive Forecasts</p>
                </div>
            </div>
            <p className="text-lg font-medium text-muted-foreground">
              Powerful Analytics Engine Coming Soon!
            </p>
            <p className="text-sm text-muted-foreground max-w-lg">
              We're building a sophisticated analytics suite just for Pro users! Soon, you'll be able to generate insightful custom reports, visualize long-term financial trends, compare different financial scenarios, and receive AI-driven predictive forecasts. Get ready to make even smarter financial decisions.
            </p>
            <p className="text-xs text-primary/80 font-semibold mt-2">Stay tuned for updates!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
