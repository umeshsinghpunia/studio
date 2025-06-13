
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { HelpCircle, BookOpen, MessageSquare, Mail } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HelpCenterPage() {
  const faqs = [
    {
      question: "How do I add a new transaction?",
      answer: "Navigate to the 'All Expenses' page from the sidebar. Click on the 'Add Transaction' button. Fill in the details like type (income/expense), category, amount, date, and any notes. Then click 'Add Transaction' to save it.",
    },
    {
      question: "How can I upgrade to the PRO plan?",
      answer: "You can upgrade to PRO by clicking the 'Upgrade to PRO' button, usually found in the sidebar or on pages/features that require a PRO subscription. This will open a dialog where you can choose your desired plan.",
    },
    {
      question: "Is my financial data secure?",
      answer: "Yes, we take data security very seriously. Your data is stored securely using Firebase's robust infrastructure. We recommend using a strong, unique password for your account and enabling two-factor authentication if available.",
    },
    {
        question: "How do I edit or delete an existing transaction/goal/card?",
        answer: "On the respective listing page (e.g., All Expenses, Goals, Cards), each item will have edit (pencil icon) and delete (trash icon) buttons. Clicking edit will take you to a form to modify the details. Clicking delete will usually ask for confirmation before permanently removing the item.",
    },
  ];

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-headline font-semibold md:text-3xl">Help Center</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <CardTitle className="font-headline">Getting Started</CardTitle>
            </div>
            <CardDescription>New to {process.env.NEXT_PUBLIC_APP_NAME || "ET"}? Here are some quick links to help you get started.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Welcome! We're excited to help you manage your finances.
            </p>
            <Button variant="outline" asChild className="w-full sm:w-auto">
                <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
            <Button variant="outline" asChild className="w-full sm:w-auto ml-0 mt-2 sm:mt-0 sm:ml-2">
                <Link href="/profile">Complete Your Profile</Link>
            </Button>
             <p className="text-sm text-muted-foreground pt-2">
              Start by adding your first transaction to see your financial overview on the dashboard.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-primary" />
              <CardTitle className="font-headline">Contact Us</CardTitle>
            </div>
            <CardDescription>Need further assistance? We're here to help.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              If you can't find an answer in our FAQs, please reach out to our support team.
            </p>
            <Button asChild className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground">
                <Link href="/support">
                    <HelpCircle className="mr-2 h-4 w-4" /> Live Chat Support
                </Link>
            </Button>
            <p className="text-sm text-muted-foreground pt-2 flex items-center">
                <Mail className="mr-2 h-4 w-4"/> Or email us at: <a href="mailto:support@example.com" className="ml-1 text-primary hover:underline">support@example.com</a>
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <HelpCircle className="h-6 w-6 text-primary" />
            <CardTitle className="font-headline">Frequently Asked Questions</CardTitle>
          </div>
          <CardDescription>Find answers to common questions about using the app.</CardDescription>
        </CardHeader>
        <CardContent>
          {faqs.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left hover:no-underline text-base font-medium">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <p className="text-muted-foreground text-center py-8">No FAQs available yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
