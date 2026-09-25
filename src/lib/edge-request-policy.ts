/** Only known non-application probe paths; ordinary 404s still use Next.js. */
export function probeResponse(request: Request): Response | undefined {
  let pathname: string;
  try {
    pathname = decodeURIComponent(new URL(request.url).pathname);
  } catch {
    return undefined;
  }

  const segments = pathname.toLowerCase().split('/');
  const privateFileProbe = segments.some((segment) =>
    segment === '.git' || segment === '.aws' ||
    segment === '.env' || segment.startsWith('.env.'),
  );
  if (!privateFileProbe && pathname.toLowerCase() !== '/@vite/env') return undefined;

  return new Response(request.method === 'HEAD' ? null : 'Not found', {
    status: 404,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
