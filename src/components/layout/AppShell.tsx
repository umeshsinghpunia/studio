
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { signOut } from 'firebase/auth';
import {
  LayoutDashboard,
  ListChecks,
  UserCircle,
  LogOut,
  Menu,
  CreditCard,
  Receipt,
  Settings,
  DollarSign,
  Briefcase, // Placeholder for Investment
  ShieldCheck, // Placeholder for Card (Security/Payment)
  Target, // Placeholder for Goals
  BarChart3, // Placeholder for Insight
  LineChart, // Placeholder for Analytics
  HelpCircle, // Placeholder for Help Center
  LifeBuoy, // Placeholder for Support
  MoreHorizontal,
  Bell,
  Search
} from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { auth } from '@/lib/firebase/config';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from '@/components/ThemeToggle';
import LoadingSpinner from '@/components/LoadingSpinner';
import { cn } from '@/lib/utils';
import { appConfig } from '@/config/app';
import { Input } from '@/components/ui/input';

const navItemsPrimary = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions', label: 'All Expenses', icon: ListChecks }, // Renamed
  { href: '/bills', label: 'Bill & Subscription', icon: Receipt }, // Combined
  // { href: '/subscriptions', label: 'Subscriptions', icon: CreditCard }, // Covered by Bill & Subscription
  // Placeholders for new items from Dribbble design
  { href: '#', label: 'Investment', icon: Briefcase, disabled: true },
  { href: '#', label: 'Card', icon: ShieldCheck, disabled: true },
  { href: '#', label: 'Goals', icon: Target, disabled: true },
];

const navItemsTools = [
  { href: '#', label: 'Insight', icon: BarChart3, disabled: true },
  { href: '#', label: 'Analytics', icon: LineChart, disabled: true },
];

const navItemsOther = [
  { href: '/profile', label: 'Profile', icon: UserCircle }, // Assuming Settings is profile
  { href: '#', label: 'Help Center', icon: HelpCircle, disabled: true },
  { href: '#', label: 'Support', icon: LifeBuoy, disabled: true },
];


export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);
  
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      const dateString = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
      const timezone = now.toLocaleTimeString('en-us',{timeZoneName:'short'}).split(' ')[2] || 'IN'; // Fallback
      setCurrentTime(`${timeString} | ${dateString} | ${timezone}`);
    };
    updateDateTime(); // Set initial time
    const timer = setInterval(updateDateTime, 1000); // Update every second
    return () => clearInterval(timer);
  }, []);


  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <LoadingSpinner size={48} />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getInitials = (name: string | null | undefined): string => {
    if (name && name.trim() !== '') {
      return name.trim()[0].toUpperCase();
    }
    return appConfig.defaultAvatarFallback;
  };

  const NavLink = ({ href, label, icon: Icon, isMobile, disabled}: typeof navItemsPrimary[0] & {isMobile?: boolean, disabled?: boolean}) => (
    <Link
      href={disabled ? '#' : href}
      onClick={() => isMobile && !disabled && setMobileMenuOpen(false)}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all",
        pathname === href && !disabled ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "text-sidebar-foreground/80 hover:text-sidebar-primary hover:bg-sidebar-accent/70",
        isMobile ? "text-base" : "text-sm",
        disabled ? "cursor-not-allowed opacity-50" : ""
      )}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : undefined}
    >
      <Icon className="h-5 w-5" />
      {label}
    </Link>
  );

  const NavSection = ({ title, items, isMobile }: { title: string, items: typeof navItemsPrimary, isMobile?: boolean }) => (
    <div className="px-2 lg:px-4">
      <h3 className="mb-2 px-3 text-xs font-semibold uppercase text-sidebar-foreground/60 tracking-wider">{title}</h3>
      <nav className="grid items-start gap-0.5">
        {items.map((item) => (
          <NavLink key={item.label} {...item} isMobile={isMobile} />
        ))}
      </nav>
    </div>
  );

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr] bg-background">
      <div className="hidden border-r bg-sidebar-background md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-16 items-center border-b border-sidebar-border px-4 lg:h-[68px] lg:px-6">
            <Link href="/dashboard" className="flex items-center gap-2.5 font-semibold text-sidebar-foreground">
              <Image src="/logo.svg" alt={`${appConfig.appName} Logo`} width={30} height={30} />
              <span className="font-headline text-xl">{appConfig.appName}</span>
            </Link>
          </div>
          <div className="flex-1 py-4 space-y-4 overflow-y-auto">
            <NavSection title="General" items={navItemsPrimary} />
            <NavSection title="Tools" items={navItemsTools} />
            <NavSection title="Other" items={navItemsOther} />
          </div>
          <div className="mt-auto p-4 border-t border-sidebar-border">
             {/* Placeholder for Upgrade to PRO */}
            <Button variant="outline" className="w-full bg-primary/10 border-primary/30 text-primary hover:bg-primary/20">
                Upgrade to PRO
            </Button>
             <Button onClick={handleLogout} variant="ghost" className="w-full justify-start text-sidebar-foreground/70 hover:text-destructive mt-2">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
            </Button>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-16 items-center gap-4 border-b bg-card px-4 lg:h-[68px] lg:px-6 sticky top-0 z-30">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden !border-border"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col bg-sidebar-background text-sidebar-foreground border-sidebar-border p-0">
               <div className="flex h-16 items-center border-b border-sidebar-border px-4 lg:h-[68px] lg:px-6">
                <Link 
                    href="/dashboard" 
                    className="flex items-center gap-2.5 font-semibold text-sidebar-foreground"
                    onClick={() => setMobileMenuOpen(false)}
                >
                  <Image src="/logo.svg" alt={`${appConfig.appName} Logo`} width={30} height={30} />
                  <span className="font-headline text-xl">{appConfig.appName}</span>
                </Link>
              </div>
              <div className="flex-1 py-4 space-y-4 overflow-y-auto">
                <NavSection title="General" items={navItemsPrimary} isMobile={true}/>
                <NavSection title="Tools" items={navItemsTools} isMobile={true}/>
                <NavSection title="Other" items={navItemsOther} isMobile={true}/>
              </div>
              <div className="mt-auto p-4 border-t border-sidebar-border">
                <Button variant="outline" className="w-full bg-primary/10 border-primary/30 text-primary hover:bg-primary/20">
                    Upgrade to PRO
                </Button>
                 <Button onClick={handleLogout} variant="ghost" className="w-full justify-start text-sidebar-foreground/70 hover:text-destructive mt-2">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                </Button>
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex flex-col">
            <h2 className="text-lg font-semibold text-foreground">Hi, {user.displayName || 'User'} 👋</h2>
            <p className="text-xs text-muted-foreground">Track your all expense and transactions</p>
          </div>

          <div className="ml-auto flex items-center gap-3 lg:gap-4">
            <div className="hidden lg:flex flex-col items-end">
                <p className="text-xs text-muted-foreground">{currentTime.split('|')[0]?.trim()}</p>
                <p className="text-xs text-muted-foreground">{currentTime.split('|')[1]?.trim()} | {currentTime.split('|')[2]?.trim()}</p>
            </div>
            <div className="relative hidden sm:block">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search expenses, transactions, cards..."
                className="pl-8 sm:w-[250px] md:w-[200px] lg:w-[300px] h-9 rounded-md !bg-background"
              />
            </div>
             <Button variant="ghost" size="icon" className="rounded-full relative text-muted-foreground hover:text-primary">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                </span>
                <span className="sr-only">Notifications</span>
            </Button>
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                    <AvatarFallback className="bg-primary/20 text-primary font-medium">{getInitials(user.displayName)}</AvatarFallback>
                  </Avatar>
                  <span className="sr-only">Toggle user menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>{user.displayName || 'My Account'}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/profile')}>
                  <UserCircle className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {/*router.push('/settings')*/}}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

