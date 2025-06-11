
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
