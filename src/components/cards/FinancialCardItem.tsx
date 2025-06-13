
"use client";

import React from 'react';
import Link from 'next/link';
import { FinancialCard, cardProviderOptions } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Edit, Trash2, Shield, Nfc } from 'lucide-react'; // Nfc for contactless symbol
import { cn } from '@/lib/utils';

interface FinancialCardItemProps {
  card: FinancialCard;
  onDelete: (card: FinancialCard) => void;
}

// Helper to get a slightly more distinct visual per provider, could be expanded
const getProviderStyles = (provider: FinancialCard['provider']) => {
  switch (provider) {
    case 'visa':
      return { bg: 'bg-blue-600', text: 'text-white', logoText: 'VISA' };
    case 'mastercard':
      return { bg: 'bg-gray-800', text: 'text-white', logoText: 'Mastercard' }; // MC has red/yellow circles usually
    case 'amex':
      return { bg: 'bg-sky-500', text: 'text-white', logoText: 'AMEX' };
    case 'discover':
      return { bg: 'bg-orange-500', text: 'text-white', logoText: 'Discover' };
    case 'rupay':
      return { bg: 'bg-indigo-600', text: 'text-white', logoText: 'RuPay'};
    default:
      return { bg: 'bg-slate-500', text: 'text-white', logoText: provider.toUpperCase() };
  }
};

export default function FinancialCardItem({ card, onDelete }: FinancialCardItemProps) {
  const providerStyle = getProviderStyles(card.provider);
  const cardTypeLabel = card.cardType.charAt(0).toUpperCase() + card.cardType.slice(1);

  return (
    <Card className={cn("shadow-lg flex flex-col overflow-hidden", providerStyle.bg)}>
      <CardHeader className={cn("pb-2", providerStyle.text)}>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="font-headline text-lg">{card.cardName}</CardTitle>
                <CardDescription className={cn("text-sm", providerStyle.text, "opacity-80")}>
                 {card.issuingBank || cardTypeLabel}
                </CardDescription>
            </div>
            <div className="text-xl font-bold tracking-wider">{providerStyle.logoText}</div>
        </div>
      </CardHeader>
      <CardContent className={cn("flex-grow", providerStyle.text)}>
        <div className="my-4 flex justify-center items-center">
            <Shield className="w-8 h-8 mr-3 opacity-70" /> {/* Chip icon */}
            <Nfc className="w-7 h-7 opacity-70" /> {/* Contactless symbol */}
        </div>
        <div className="text-center text-2xl font-mono tracking-widest mb-2">
          •••• •••• •••• {card.lastFourDigits}
        </div>
        <div className="flex justify-between text-xs items-center">
          <div>
            <p className="opacity-70">Card Holder</p>
            <p className="font-medium">{card.cardHolderName.toUpperCase()}</p>
          </div>
          <div>
            <p className="opacity-70 text-right">Expires</p>
            <p className="font-medium text-right">{card.expiryMonth}/{card.expiryYear.slice(-2)}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-black/10 p-3 flex justify-end gap-2">
        <Button variant="ghost" size="icon" asChild className="text-white/80 hover:text-white hover:bg-white/20">
          <Link href={`/cards/edit/${card.id}`}>
            <Edit className="h-4 w-4" />
            <span className="sr-only">Edit Card</span>
          </Link>
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onDelete(card)} className="text-white/80 hover:text-red-400 hover:bg-white/20">
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete Card</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
