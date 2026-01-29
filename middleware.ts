import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const nonce = Buffer.from(crypto.randomUUID()).toString('base64');

    // CSP: Strict policy but allowing Google/Vercel scripts
    // We use 'unsafe-inline' for style-src because Tailwind/Next often inline styles (until strict nonce support is fully stable in all Next/React versions).
    // Ideally we would verify everything with nonces.
    const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://apis.google.com https://*.vercel-scripts.com https://va.vercel-scripts.com;
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https://*.googleusercontent.com https://lh3.googleusercontent.com;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    block-all-mixed-content;
    upgrade-insecure-requests;
`;
    // Replace newlines with spaces
    const contentSecurityPolicyHeaderValue = cspHeader
        .replace(/\s{2,}/g, ' ')
        .trim();

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-nonce', nonce);
    requestHeaders.set(
        'Content-Security-Policy',
        contentSecurityPolicyHeaderValue
    );

    const response = NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });

    // Set Security Headers
    response.headers.set(
        'Content-Security-Policy',
        contentSecurityPolicyHeaderValue
    );
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
    response.headers.set(
        'Strict-Transport-Security',
        'max-age=63072000; includeSubDomains; preload'
    );
    response.headers.set('X-DNS-Prefetch-Control', 'off');

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        {
            source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
            missing: [
                { type: 'header', key: 'next-router-prefetch' },
                { type: 'header', key: 'purpose', value: 'prefetch' },
            ],
        },
    ],
};
