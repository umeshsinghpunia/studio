
export interface Country {
  code: string;
  name: string;
  currency: string;
  currencySymbol: string;
  flag: string; // emoji flag
}

export interface AppUser {
  uid: string;
  name: string | null;
  email: string | null;
  country: Country | null;
  mobile: string | null;
  createdAt: string;
}

export type TransactionType = 'income' | 'expense';

export const TransactionCategories = {
  income: [
    { id: 'salary', name: 'Salary', icon: 'Briefcase' },
    { id: 'freelance', name: 'Freelance', icon: 'Laptop' },
    { id: 'investment', name: 'Investment', icon: 'TrendingUp' },
    { id: 'gift', name: 'Gift', icon: 'Gift' },
    { id: 'other', name: 'Other', icon: 'CircleDollarSign' },
  ],
  expense: [
    { id: 'food', name: 'Food', icon: 'Utensils' },
    { id: 'transport', name: 'Transport', icon: 'Car' },
    { id: 'bills', name: 'Bills', icon: 'FileText' },
    { id: 'housing', name: 'Housing', icon: 'Home' },
    { id: 'entertainment', name: 'Entertainment', icon: 'Gamepad2' },
    { id: 'health', name: 'Health', icon: 'HeartPulse' },
    { id: 'shopping', name: 'Shopping', icon: 'ShoppingBag' },
    { id: 'education', name: 'Education', icon: 'School' },
    { id: 'other', name: 'Other', icon: 'CircleDollarSign' },
  ],
};

export type Category = {
  id: string;
  name: string;
  icon: string; // Lucide icon name string
};

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  category: Category;
  date: string; // ISO string date
  notes?: string;
  createdAt: string; // ISO string date
  updatedAt?: string; // ISO string date
}

export type SubscriptionStatus = 'active' | 'inactive' | 'pending_payment' | 'cancelled';

export interface Subscription {
  id: string;
  userId: string;
  name: string;
  amount: number;
  billingCycle: 'monthly' | 'yearly' | 'weekly' | 'daily';
  nextPaymentDate: string; // ISO string
  category?: string;
  notes?: string;
  status: SubscriptionStatus;
  createdAt: string; // ISO string date
  updatedAt?: string; // ISO string date
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySubscriptionId?: string; // For Razorpay's recurring subscriptions
}

export type InvestmentType = 'stocks' | 'crypto' | 'real_estate' | 'mutual_funds' | 'etf' | 'bonds' | 'other';

export const investmentTypeOptions: { value: InvestmentType; label: string; icon: string }[] = [
  { value: 'stocks', label: 'Stocks', icon: 'TrendingUp' },
  { value: 'crypto', label: 'Cryptocurrency', icon: 'Activity' },
  { value: 'real_estate', label: 'Real Estate', icon: 'Home' },
  { value: 'mutual_funds', label: 'Mutual Funds', icon: 'Landmark' },
  { value: 'etf', label: 'ETF', icon: 'BarChartBig' },
  { value: 'bonds', label: 'Bonds', icon: 'FileText' },
  { value: 'other', label: 'Other', icon: 'Package' },
];

export interface Investment {
  id: string;
  userId: string;
  name: string;
  type: InvestmentType;
  typeName: string;
  typeIcon: string;
  amountInvested: number;
  investmentDate: string; // ISO string
  quantity?: number;
  currentValue?: number;
  notes?: string;
  createdAt: string; // ISO string
  updatedAt?: string; // ISO string
}

// Financial Cards
export type CardProvider = 'visa' | 'mastercard' | 'amex' | 'discover' | 'rupay' | 'other';
export type CardType = 'credit' | 'debit';

export const cardProviderOptions: { value: CardProvider; label: string }[] = [
  { value: 'visa', label: 'Visa' },
  { value: 'mastercard', label: 'Mastercard' },
  { value: 'amex', label: 'American Express' },
  { value: 'discover', label: 'Discover' },
  { value: 'rupay', label: 'RuPay' },
  { value: 'other', label: 'Other' },
];

export const cardTypeOptions: { value: CardType; label: string }[] = [
  { value: 'credit', label: 'Credit Card' },
  { value: 'debit', label: 'Debit Card' },
];

export interface FinancialCard {
  id: string;
  userId: string;
  cardName: string;
  cardHolderName: string;
  lastFourDigits: string;
  expiryMonth: string; // MM
  expiryYear: string; // YYYY
  provider: CardProvider;
  cardType: CardType;
  issuingBank?: string;
  notes?: string;
  createdAt: string; // ISO string
  updatedAt?: string; // ISO string
}

// Financial Goals
export interface FinancialGoal {
  id: string;
  userId: string;
  goalName: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string; // ISO string, optional
  description?: string;
  icon?: string; // Lucide icon name, optional
  createdAt: string; // ISO string
  updatedAt?: string; // ISO string
}
