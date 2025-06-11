import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <>
      <h2 className="mb-6 text-center text-2xl font-headline font-semibold tracking-tight text-foreground">
        Welcome Back
      </h2>
      <LoginForm />
    </>
  );
}
