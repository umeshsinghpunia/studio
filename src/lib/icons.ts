
import * as LucideIcons from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import React from 'react';

// A type for all Lucide icon names
export type IconName = keyof typeof LucideIcons;

// A type guard to check if a string is a valid IconName
function isValidIconName(name: string): name is IconName {
  return Object.prototype.hasOwnProperty.call(LucideIcons, name);
}

// Function to get a Lucide icon component by name
export const getLucideIcon = (name: string | undefined | null, defaultIconName: IconName = 'HelpCircle'): React.FC<LucideProps> => {
  if (name && isValidIconName(name)) {
    const IconComponent = LucideIcons[name] as React.FC<LucideProps>;
    // Check if it's a valid React component (functional or class component)
    // Lucide icons are typically functions.
    if (typeof IconComponent === 'function') {
      return IconComponent;
    }
  }
  // Fallback to a default icon if the name is invalid or not provided
  return LucideIcons[defaultIconName] as React.FC<LucideProps>;
};
