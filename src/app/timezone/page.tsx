import { permanentRedirect } from 'next/navigation';

export default function TimezoneRedirect() {
  permanentRedirect('/time');
}
