import { redirect } from 'next/navigation';

// Root redirects to patient dashboard (demo identity — no auth gate for MVP)
export default function Root() {
  redirect('/patient');
}
