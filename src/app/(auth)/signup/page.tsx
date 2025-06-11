import SignUpForm from '@/components/auth/SignUpForm';

export default function SignUpPage() {
  return (
    <>
      <h2 className="mb-6 text-center text-2xl font-headline font-semibold tracking-tight text-foreground">
        Create an Account
      </h2>
      <SignUpForm />
    </>
  );
}
