
import type { Country } from '@/types';

export const countries: Country[] = [
  { name: 'United States', code: 'US', currency: 'USD', currencySymbol: '$', flag: '🇺🇸' },
  { name: 'Canada', code: 'CA', currency: 'CAD', currencySymbol: '$', flag: '🇨🇦' },
  { name: 'United Kingdom', code: 'GB', currency: 'GBP', currencySymbol: '£', flag: '🇬🇧' },
  { name: 'Australia', code: 'AU', currency: 'AUD', currencySymbol: '$', flag: '🇦🇺' },
  { name: 'Germany', code: 'DE', currency: 'EUR', currencySymbol: '€', flag: '🇩🇪' },
  { name: 'France', code: 'FR', currency: 'EUR', currencySymbol: '€', flag: '🇫🇷' },
  { name: 'Japan', code: 'JP', currency: 'JPY', currencySymbol: '¥', flag: '🇯🇵' },
  { name: 'India', code: 'IN', currency: 'INR', currencySymbol: '₹', flag: '🇮🇳' },
  { name: 'Brazil', code: 'BR', currency: 'BRL', currencySymbol: 'R$', flag: '🇧🇷' },
  { name: 'South Africa', code: 'ZA', currency: 'ZAR', currencySymbol: 'R', flag: '🇿🇦' },
  { name: 'China', code: 'CN', currency: 'CNY', currencySymbol: '¥', flag: '🇨🇳' },
  { name: 'Russia', code: 'RU', currency: 'RUB', currencySymbol: '₽', flag: '🇷🇺' },
  { name: 'Mexico', code: 'MX', currency: 'MXN', currencySymbol: '$', flag: '🇲🇽' },
  { name: 'New Zealand', code: 'NZ', currency: 'NZD', currencySymbol: '$', flag: '🇳🇿' },
  { name: 'Singapore', code: 'SG', currency: 'SGD', currencySymbol: '$', flag: '🇸🇬' },
  { name: 'Switzerland', code: 'CH', currency: 'CHF', currencySymbol: 'CHF', flag: '🇨🇭' },
  { name: 'Nigeria', code: 'NG', currency: 'NGN', currencySymbol: '₦', flag: '🇳🇬' },
  { name: 'Egypt', code: 'EG', currency: 'EGP', currencySymbol: 'E£', flag: '🇪🇬' },
  { name: 'Argentina', code: 'AR', currency: 'ARS', currencySymbol: '$', flag: '🇦🇷' },
  { name: 'Saudi Arabia', code: 'SA', currency: 'SAR', currencySymbol: '﷼', flag: '🇸🇦' },
  // Add more countries as needed
];

export const getCountryByCode = (code: string): Country | undefined => {
  return countries.find(country => country.code === code);
};
