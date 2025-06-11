
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Star } from "lucide-react";

interface PlanSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const plans = [
  {
    name: "Monthly Pro",
    price: "$10",
    frequency: "/month",
    features: [
      "Unlimited Transactions",
      "Advanced Reporting",
      "Priority Support",
      "Budgeting Tools",
    ],
    icon: Star,
    bgColor: "bg-primary/10",
    borderColor: "border-primary/30",
    buttonText: "Choose Monthly",
    highlight: false,
  },
  {
    name: "Annual Pro",
    price: "$99",
    frequency: "/year",
    features: [
      "All Monthly Pro features",
      "Save 17% annually",
      "Early access to new features",
      "Dedicated Account Manager",
    ],
    icon: Star,
    bgColor: "bg-accent/10",
    borderColor: "border-accent/30",
    buttonText: "Choose Annual",
    highlight: true,
    badge: "Most Popular",
  },
];

export default function PlanSelectionDialog({ open, onOpenChange }: PlanSelectionDialogProps) {
  const handleChoosePlan = (planName: string) => {
    console.log(`Plan chosen: ${planName}`);
    onOpenChange(false);
    // Here you would typically navigate to a checkout page or initiate a payment flow
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-2xl font-headline text-center">Upgrade to PRO</DialogTitle>
          <DialogDescription className="text-center">
            Unlock premium features and take control of your finances.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-6 pb-6 max-h-[70vh] overflow-y-auto">
          {plans.map((plan) => (
            <Card key={plan.name} className={`flex flex-col ${plan.highlight ? plan.borderColor + ' border-2 shadow-lg' : 'shadow-md'}`}>
              {plan.highlight && plan.badge && (
                <div className="bg-accent text-accent-foreground text-xs font-semibold py-1 px-3 rounded-t-lg text-center">
                  {plan.badge}
                </div>
              )}
              <CardHeader className="items-center text-center">
                <div className={`p-3 rounded-full ${plan.bgColor} mb-2`}>
                  <plan.icon className={`h-8 w-8 ${plan.highlight ? 'text-accent' : 'text-primary'}`} />
                </div>
                <CardTitle className="font-headline text-xl">{plan.name}</CardTitle>
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">{plan.frequency}</span>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <DialogFooter className="p-4 border-t">
                <Button
                  onClick={() => handleChoosePlan(plan.name)}
                  className={`w-full ${plan.highlight ? 'bg-accent hover:bg-accent/90 text-accent-foreground' : 'bg-primary hover:bg-primary/90 text-primary-foreground'}`}
                >
                  {plan.buttonText}
                </Button>
              </DialogFooter>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
