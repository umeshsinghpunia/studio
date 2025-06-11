
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(
  amount: number, 
  currencySymbol: string = '$', 
  locale: string = 'en-US'
): string {
  try {
    // This is a simplified approach. For robust international currency formatting,
    // you'd need the currency code (e.g., 'USD', 'EUR') and use Intl.NumberFormat.
    // Example: new Intl.NumberFormat(locale, { style: 'currency', currency: currencyCode }).format(amount);
    // For now, we prepend the symbol. This might not be correct for all locales/currencies.
    const formattedAmount = amount.toLocaleString(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `${currencySymbol}${formattedAmount}`;
  } catch (error) {
    // Fallback for any unexpected errors
    return `${currencySymbol}${amount.toFixed(2)}`;
  }
}

export function getInitials(name: string | null | undefined): string {
  if (!name) return 'SW';
  const names = name.trim().split(' ').filter(Boolean); // filter out empty strings from multiple spaces
  if (names.length === 0) return 'SW';
  if (names.length === 1) {
    return names[0].substring(0, 2).toUpperCase();
  }
  const firstInitial = names[0][0];
  const lastInitial = names[names.length - 1][0];
  return `${firstInitial}${lastInitial}`.toUpperCase();
}

export function formatDate(dateString: string, options?: Intl.DateTimeFormatOptions): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  try {
    return new Date(dateString).toLocaleDateString(undefined, options || defaultOptions);
  } catch (error) {
    return 'Invalid Date';
  }
}
