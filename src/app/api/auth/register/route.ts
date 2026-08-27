import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  const { name, email, password } = await req.json();

  if (!name || !email || !password) {
    return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ success: false, error: 'Password must be at least 6 characters.' }, { status: 400 });
  }

  const admin = createAdminClient();

  // 1. Create auth user via admin API (no email confirmation required for hackathon)
  const { data: authData, error: authErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name },
  });

  if (authErr || !authData.user) {
    return NextResponse.json({ success: false, error: authErr?.message ?? 'Failed to create account.' }, { status: 400 });
  }

  // 2. Create patient row linked to this auth user (admin client bypasses RLS)
  const { error: dbErr } = await admin.from('patients').insert({
    name,
    email,
    user_id: authData.user.id,
  });

  if (dbErr) {
    // Rollback: delete the auth user
    await admin.auth.admin.deleteUser(authData.user.id);
    return NextResponse.json({ success: false, error: 'Account created but profile setup failed. Please try again.' }, { status: 500 });
  }

  return NextResponse.json({ success: true, userId: authData.user.id });
}
