
import ProfileForm from '@/components/profile/ProfileForm';

export default function ProfilePage() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <h1 className="text-2xl font-headline font-semibold md:text-3xl">My Profile</h1>
      <ProfileForm />
    </div>
  );
}
