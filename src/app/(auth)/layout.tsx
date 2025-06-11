import Image from 'next/image';
import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-6">
      <div className="mb-8 flex flex-col items-center">
        <Link href="/" className="flex items-center gap-2 mb-2">
          <Image src="/logo.svg" alt="SpendWise Logo" width={40} height={40} />
          <h1 className="text-3xl font-headline font-semibold text-primary">SpendWise</h1>
        </Link>
        <p className="text-muted-foreground">Track your expenses wisely.</p>
      </div>
      <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-lg sm:p-8">
        {children}
      </div>
       <p className="mt-8 text-center text-sm text-muted-foreground">
        {new Date().getFullYear()} © SpendWise. All rights reserved.
      </p>
    </div>
  );
}
