import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';

export type UserRole = 'patient' | 'doctor' | null;

// ─────────────────────────────────────────────
//  Get the currently logged-in Supabase user.
//  Returns null if not authenticated.
// ─────────────────────────────────────────────
export async function getUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// ─────────────────────────────────────────────
//  Determine whether the logged-in user is a
//  patient or a doctor by checking both tables.
// ─────────────────────────────────────────────
export async function getUserRole(userId: string): Promise<UserRole> {
  const supabase = createAdminClient();

  const [{ data: patient }, { data: provider }] = await Promise.all([
    supabase.from('patients').select('id').eq('user_id', userId).single(),
    supabase.from('providers').select('id').eq('user_id', userId).single(),
  ]);

  if (provider) return 'doctor';
  if (patient) return 'patient';
  return null;
}

// ─────────────────────────────────────────────
//  Get the patients.id for the logged-in user.
//  Redirects to /login if not authenticated.
//  Redirects to /doctor if user is a doctor.
// ─────────────────────────────────────────────
export async function requirePatientId(): Promise<string> {
  const user = await getUser();
  if (!user) redirect('/login');

  const supabase = createAdminClient();
  const { data: patient } = await supabase
    .from('patients')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!patient) {
    // User exists in auth but not in patients → might be a doctor
    const role = await getUserRole(user.id);
    if (role === 'doctor') redirect('/doctor');
    redirect('/login');
  }

  return patient.id;
}

// ─────────────────────────────────────────────
//  Get the providers.id for the logged-in doctor.
//  Redirects to /login if not authenticated.
// ─────────────────────────────────────────────
export async function requireDoctorId(): Promise<string> {
  const user = await getUser();
  if (!user) redirect('/login');

  const supabase = createAdminClient();
  const { data: provider } = await supabase
    .from('providers')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!provider) redirect('/patient');
  return provider.id;
}

// ─────────────────────────────────────────────
//  Get patient ID from a Next.js API route
//  request (reads session from cookies).
//  Returns null if unauthenticated.
// ─────────────────────────────────────────────
export async function getPatientIdFromRequest(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createAdminClient();
  const { data: patient } = await admin
    .from('patients')
    .select('id')
    .eq('user_id', user.id)
    .single();

  return patient?.id ?? null;
}
