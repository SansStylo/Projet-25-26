import { redirect } from 'next/navigation';

export default function NotFound() {
  // Redirige immédiatement vers la page d'accueil
  redirect('/');
}