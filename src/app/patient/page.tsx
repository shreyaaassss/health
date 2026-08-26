// Patient home — redirects to records dashboard
import { redirect } from 'next/navigation';

export default function PatientHome() {
  redirect('/patient/records');
}
