import type { Metadata } from 'next';
import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import { DEMO } from '@/constants/api';

export const metadata: Metadata = { title: 'Home · Health Wallet' };

async function getDashboardStats() {
  const supabase = createAdminClient();

  const [{ count: recordCount }, { count: activeGrants }, { data: patient }] = await Promise.all([
    supabase.from('medical_records').select('*', { count: 'exact', head: true }).eq('patient_id', DEMO.PATIENT_ID),
    supabase.from('access_grants').select('*', { count: 'exact', head: true }).eq('patient_id', DEMO.PATIENT_ID).eq('status', 'ACTIVE'),
    supabase.from('patients').select('name').eq('id', DEMO.PATIENT_ID).single(),
  ]);

  return {
    recordCount: recordCount ?? 0,
    activeGrants: activeGrants ?? 0,
    name: patient?.name ?? 'Patient',
  };
}

const FEATURE_CARDS = [
  {
    href: '/patient/records',
    icon: '🗂️',
    title: 'My Records',
    description: 'View and manage your medical records',
    color: 'bg-blue-50 border-blue-100',
    iconBg: 'bg-blue-100',
  },
  {
    href: '/patient/share',
    icon: '📤',
    title: 'Share Records',
    description: 'Securely share records with a provider',
    color: 'bg-teal-50 border-teal-100',
    iconBg: 'bg-teal-100',
  },
  {
    href: '/patient/access',
    icon: '🔑',
    title: 'Active Access',
    description: 'See who has access and revoke it',
    color: 'bg-amber-50 border-amber-100',
    iconBg: 'bg-amber-100',
  },
  {
    href: '/patient/history',
    icon: '🕐',
    title: 'Access History',
    description: 'Full audit trail of all access events',
    color: 'bg-violet-50 border-violet-100',
    iconBg: 'bg-violet-100',
  },
  {
    href: '/patient/appointment',
    icon: '📋',
    title: 'Appointment Form',
    description: 'Fill your details for an upcoming visit',
    color: 'bg-green-50 border-green-100',
    iconBg: 'bg-green-100',
    badge: 'New',
  },
  {
    href: '/patient/profile',
    icon: '👤',
    title: 'My Profile',
    description: 'View and update your health profile',
    color: 'bg-slate-50 border-slate-200',
    iconBg: 'bg-slate-100',
  },
];

export default async function HomePage() {
  const { recordCount, activeGrants, name } = await getDashboardStats();
  const firstName = name.split(' ')[0];

  return (
    <div className="px-4 pt-6 pb-4">

      {/* Header */}
      <div className="mb-6">
        <p className="text-xs font-medium text-teal-600 uppercase tracking-widest">Welcome back</p>
        <h1 className="text-2xl font-bold text-slate-900 mt-1">Hello, {firstName} 👋</h1>
        <p className="text-sm text-slate-400 mt-0.5">Your Health Wallet</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Link href="/patient/records"
          className="bg-white border border-slate-100 rounded-2xl px-4 py-3 shadow-sm active:scale-[0.98] transition-transform">
          <p className="text-2xl font-bold text-slate-900">{recordCount}</p>
          <p className="text-xs text-slate-500 mt-0.5">Medical Record{recordCount !== 1 ? 's' : ''}</p>
        </Link>
        <Link href="/patient/access"
          className={`rounded-2xl px-4 py-3 shadow-sm active:scale-[0.98] transition-transform border
            ${activeGrants > 0 ? 'bg-teal-50 border-teal-200' : 'bg-white border-slate-100'}`}>
          <div className="flex items-center gap-1.5">
            <p className="text-2xl font-bold text-slate-900">{activeGrants}</p>
            {activeGrants > 0 && (
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse mt-1" />
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Active Share{activeGrants !== 1 ? 's' : ''}</p>
        </Link>
      </div>

      {/* Privacy banner */}
      <div className="flex items-center gap-3 bg-slate-900 rounded-2xl px-4 py-3 mb-6">
        <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
          </svg>
        </div>
        <div>
          <p className="text-xs font-bold text-white">Your data, your control</p>
          <p className="text-xs text-slate-400">You decide who sees it, what they see, and for how long.</p>
        </div>
      </div>

      {/* Feature cards */}
      <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-3">Features</p>
      <div className="space-y-3">
        {FEATURE_CARDS.map(({ href, icon, title, description, color, iconBg, badge }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-4 rounded-2xl px-4 py-4 border ${color} active:scale-[0.98] transition-transform shadow-sm`}
          >
            <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center text-2xl flex-shrink-0`}>
              {icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-slate-900">{title}</p>
                {badge && (
                  <span className="text-[10px] font-bold bg-teal-500 text-white px-1.5 py-0.5 rounded-full">
                    {badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{description}</p>
            </div>
            <svg className="w-4 h-4 text-slate-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ))}
      </div>

      <p className="text-center text-xs text-slate-300 mt-6">
        Your Health. Your Data. Your Control.
      </p>
    </div>
  );
}
