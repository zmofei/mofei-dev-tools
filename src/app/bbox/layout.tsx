import { Metadata } from 'next';
import { getMetadata } from './metadata';

export async function generateMetadata(): Promise<Metadata> {
  return getMetadata();
}

export default function BBoxLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}