import { redirect } from 'next/navigation';
import { getUser, getUserRole } from '@/lib/auth';

export default async function Root() {
  const user = await getUser();
  if (!user) redirect('/login');

  const role = await getUserRole(user.id);
  if (role === 'doctor') redirect('/doctor');
  redirect('/patient');
}
