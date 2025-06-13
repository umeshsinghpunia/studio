
import ChatInterface from '@/components/support/ChatInterface';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LifeBuoy } from 'lucide-react';

export default function SupportPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 h-full">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-headline font-semibold md:text-3xl">Support Chat</h1>
      </div>
      <Card className="shadow-lg flex-1 flex flex-col">
        <CardHeader>
          <div className="flex items-center gap-2">
            <LifeBuoy className="h-6 w-6 text-primary" />
            <CardTitle className="font-headline">Live Support</CardTitle>
          </div>
          <CardDescription>Chat with our support team for assistance. We typically reply within a few minutes during business hours.</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
          <ChatInterface />
        </CardContent>
      </Card>
    </div>
  );
}
