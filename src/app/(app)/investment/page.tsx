
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Briefcase, PlusCircle } from 'lucide-react';

export default function InvestmentPage() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-headline font-semibold md:text-3xl">Manage Investments</h1>
        {/* Placeholder for Add Investment button - can be enabled when functionality is ready */}
        {/* 
        <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Link href="/investment/add">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Investment
          </Link>
        </Button> 
        */}
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-primary" />
            <CardTitle className="font-headline">Your Investments</CardTitle>
          </div>
          <CardDescription>Track your portfolio and investment growth.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
            <Briefcase className="h-16 w-16 text-muted-foreground/50" />
            <p className="text-lg font-medium text-muted-foreground">
              Investment tracking is coming soon!
            </p>
            <p className="text-sm text-muted-foreground max-w-md">
              As a Pro user, you'll soon be able to link investment accounts, monitor performance, analyze your assets, and see detailed reports right here.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
