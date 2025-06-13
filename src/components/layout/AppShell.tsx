
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
  Briefcase,
  ShieldCheck,
  Target,
  BarChart3,
  LineChart,
  HelpCircle,
  LifeBuoy,
  MoreHorizontal,
  Bell,
  Search,
  Package,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import React, { useState, useEffect, useMemo, useCallback } from 'react';

import { auth, db } from '@/lib/firebase/config';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc, writeBatch, Timestamp } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet';
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
import { cn, formatDate } from '@/lib/utils';
import { appConfig } from '@/config/app';
import { Input } from '@/components/ui/input';
import PlanSelectionDialog from '@/components/pro/PlanSelectionDialog';
import { useToast } from '@/hooks/use-toast';
import type { NotificationItem, NotificationType } from '@/types';
import { getLucideIcon } from '@/lib/icons';


export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false);
  const [isProUser, setIsProUser] = useState(false); // Simulates Pro status
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);


  const navItemsPrimary = useMemo(() => [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, disabled: false },
    { href: '/transactions', label: 'All Expenses', icon: ListChecks, disabled: false },
    { href: '/bills', label: 'Bill & Subscription', icon: Receipt, disabled: false },
    { href: '/investment', label: 'Investment', icon: Briefcase, disabled: !isProUser },
    { href: '/cards', label: 'Cards', icon: ShieldCheck, disabled: !isProUser },
    { href: '/goals', label: 'Goals', icon: Target, disabled: !isProUser },
  ], [isProUser]);

  const navItemsTools = useMemo(() => [
    { href: '/insight', label: 'Insight', icon: BarChart3, disabled: !isProUser },
    { href: '/analytics', label: 'Analytics', icon: LineChart, disabled: !isProUser },
  ], [isProUser]);

  const navItemsOther = useMemo(() => [
    { href: '/profile', label: 'Profile', icon: UserCircle, disabled: false },
    { href: '/help-center', label: 'Help Center', icon: HelpCircle, disabled: !isProUser },
    { href: '/support', label: 'Support', icon: LifeBuoy, disabled: !isProUser },
  ], [isProUser]);


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
      const timezone = now.toLocaleTimeString('en-us',{timeZoneName:'short'}).split(' ')[2] || 'IN';
      setCurrentTime(`${timeString} | ${dateString} | ${timezone}`);
    };
    updateDateTime();
    const timer = setInterval(updateDateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch notifications in real-time
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    const notificationsRef = collection(db, 'users', user.uid, 'notifications');
    const q = query(notificationsRef, orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedNotifications: NotificationItem[] = [];
      snapshot.forEach((doc) => {
        fetchedNotifications.push({ id: doc.id, ...doc.data() } as NotificationItem);
      });
      setNotifications(fetchedNotifications);
    }, (error) => {
      console.error("Error fetching notifications:", error);
      toast({
        title: "Error",
        description: "Could not fetch notifications.",
        variant: "destructive",
      });
    });

    return () => unsubscribe();
  }, [user, toast]);

  const hasUnreadNotifications = useMemo(() => notifications.some(n => !n.read), [notifications]);

  const markNotificationsAsRead = useCallback(async () => {
    if (!user || notifications.length === 0) return;

    const unreadNotifications = notifications.filter(n => !n.read);
    if (unreadNotifications.length === 0) return;

    const batch = writeBatch(db);
    unreadNotifications.forEach(notification => {
      const notificationRef = doc(db, 'users', user.uid, 'notifications', notification.id);
      batch.update(notificationRef, { read: true });
    });

    try {
      await batch.commit();
    } catch (error) {
      console.error("Error marking notifications as read:", error);
      toast({
        title: "Error",
        description: "Could not update notification status.",
        variant: "destructive",
      });
    }
  }, [user, notifications, toast]);

  const handleNotificationDropdownOpenChange = (open: boolean) => {
    setIsNotificationDropdownOpen(open);
    if (open && hasUnreadNotifications) {
      markNotificationsAsRead();
    }
  };


  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleSuccessfulUpgrade = () => {
    setIsProUser(true);
    setIsPlanDialogOpen(false);
    toast({ title: "Upgrade Successful!", description: "Pro features are now unlocked." });
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
      const parts = name.trim().split(' ');
      if (parts.length > 1) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      }
      return parts[0].substring(0, 2).toUpperCase();
    }
    return appConfig.defaultAvatarFallback;
  };
  

  const NavLink = ({ href, label, icon: Icon, isMobile, disabled}: typeof navItemsPrimary[0] & {isMobile?: boolean, disabled?: boolean}) => (
    <Link
      href={disabled ? '#' : href}
      onClick={() => {
        if (disabled) {
            setIsPlanDialogOpen(true); 
            if (isMobile) setMobileMenuOpen(false);
            return;
        }
        if (isMobile) setMobileMenuOpen(false);
      }}
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

  const NavSection = ({ title, items, isMobile }: { title: string, items: ReturnType<typeof useMemo<(typeof navItemsPrimary[0])[]>>, isMobile?: boolean }) => (
    <div className="px-2 lg:px-4">
      <h3 className="mb-2 px-3 text-xs font-semibold uppercase text-sidebar-foreground/60 tracking-wider">{title}</h3>
      <nav className="grid items-start gap-0.5">
        {items.map((item) => (
          <NavLink key={item.label} {...item} isMobile={isMobile} />
        ))}
      </nav>
    </div>
  );
  
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'info': return Package;
      case 'alert': return AlertCircle;
      case 'success': return CheckCircle;
      case 'payment': return Receipt;
      case 'update': return Bell; // Or another relevant icon
      default: return Bell;
    }
  };

  return (
    <>
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
            <Button
              variant="outline"
              className="w-full bg-primary/10 border-primary/30 text-primary hover:bg-primary/20"
              onClick={() => setIsPlanDialogOpen(true)}
              disabled={isProUser}
            >
                {isProUser ? "Pro Plan Active" : "Upgrade to PRO"}
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
               <SheetTitle className="sr-only">Main Navigation</SheetTitle>
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
                <Button
                  variant="outline"
                  className="w-full bg-primary/10 border-primary/30 text-primary hover:bg-primary/20"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsPlanDialogOpen(true);
                  }}
                  disabled={isProUser}
                >
                    {isProUser ? "Pro Plan Active" : "Upgrade to PRO"}
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
            <DropdownMenu open={isNotificationDropdownOpen} onOpenChange={handleNotificationDropdownOpenChange}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full relative text-muted-foreground hover:text-primary">
                    <Bell className="h-5 w-5" />
                    {hasUnreadNotifications && (
                        <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                        </span>
                    )}
                    <span className="sr-only">Notifications</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 md:w-96 max-h-[400px] overflow-y-auto">
                <DropdownMenuLabel className="flex justify-between items-center">
                  Notifications
                  {/* <Button variant="link" size="sm" className="p-0 h-auto text-xs">Mark all as read</Button> */}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length === 0 ? (
                   <DropdownMenuItem disabled className="text-center text-muted-foreground py-4">
                    No new notifications.
                  </DropdownMenuItem>
                ) : (
                  notifications.map((notification) => {
                    const Icon = getNotificationIcon(notification.type);
                    const itemContent = (
                      <div className="flex items-start gap-3">
                        <Icon className={cn("mt-1 h-5 w-5 shrink-0", 
                          notification.type === 'alert' ? 'text-destructive' :
                          notification.type === 'success' ? 'text-green-500' :
                          'text-primary'
                        )} />
                        <div className="flex-1">
                          <p className={cn("font-medium text-sm", !notification.read && "font-bold")}>{notification.title}</p>
                          <p className="text-xs text-muted-foreground">{notification.message}</p>
                          <p className="text-2xs text-muted-foreground/70 mt-0.5">
                            {notification.timestamp instanceof Timestamp ? formatDate(notification.timestamp.toDate().toISOString(), { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' }) : 'Just now'}
                          </p>
                        </div>
                      </div>
                    );
                    return (
                      <DropdownMenuItem
                        key={notification.id}
                        className={cn("data-[disabled]:opacity-100", !notification.read && "bg-primary/5 hover:bg-primary/10")}
                        onClick={() => {
                          if (notification.link) router.push(notification.link);
                          // Optionally mark as read individually on click too
                        }}
                      >
                        {itemContent}
                      </DropdownMenuItem>
                    );
                  })
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="justify-center text-sm text-primary hover:!text-primary py-2">
                  View All Notifications (Coming Soon)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

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
    <PlanSelectionDialog
        open={isPlanDialogOpen}
        onOpenChange={setIsPlanDialogOpen}
        onSuccessfulUpgrade={handleSuccessfulUpgrade}
    />
    </>
  );
}
