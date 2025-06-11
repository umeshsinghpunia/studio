
export interface AppConfig {
  appName: string;
  appDescription: string; // Full description for metadata
  appTagline: string; // Shorter tagline for UI elements like auth layout
  defaultAvatarFallback: string; // Single character for avatar if user name is not available
  defaultCurrencySymbol: string; // Default currency symbol
}

export const appConfig: AppConfig = {
  appName: 'SpendWise',
  appDescription: 'Modern expense tracker app to manage your income and expenses efficiently.',
  appTagline: 'Track your expenses wisely.',
  defaultAvatarFallback: 'S',
  defaultCurrencySymbol: '$',
};

