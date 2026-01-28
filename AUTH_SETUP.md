# Authentication Setup Guide

## 1. Google OAuth 2.0 Configuration (via NextAuth.js / Auth.js)

### Requirements
- **NextAuth.js**: `npm install next-auth`
- **Google Cloud Console Project**: Create a new project and configure OAuth consent screen.

### Steps
1. **Google Cloud Console**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/).
   - Create a new project "Nemo App".
   - Configure **OAuth Consent Screen** (User Type: External).
   - Create **Credentials** > **OAuth Client ID** (Web application).
   - Add Authorized JavaScript origins: `http://localhost:3000` (and production domain).
   - Add Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`.
   - Copy **Client ID** and **Client Secret**.

2. **Environment Variables**:
   Add to `.env`:
   ```env
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   NEXTAUTH_SECRET=generate_random_string
   NEXTAUTH_URL=http://localhost:3000
   ```

3. **Implementation**:
   Create `app/api/auth/[...nextauth]/route.ts`:
   ```typescript
   import NextAuth from "next-auth";
   import GoogleProvider from "next-auth/providers/google";
   import { PrismaAdapter } from "@auth/prisma-adapter";
   import { prisma } from "@/lib/prisma";

   const handler = NextAuth({
     adapter: PrismaAdapter(prisma),
     providers: [
       GoogleProvider({
         clientId: process.env.GOOGLE_CLIENT_ID!,
         clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
       }),
     ],
     events: {
       createUser: async ({ user }) => {
         // Check for student email on signup
         if (user.email && (user.email.endsWith('.ac.il') || user.email.endsWith('.edu'))) {
           await prisma.user.update({
             where: { id: user.id },
             data: { isStudent: true, isPro: true }, // Automatic Pro for students
           });
         }
       }
     }
   });

   export { handler as GET, handler as POST };
   ```

## 2. Student Email Verification Logic

The logic is embedded in the `createUser` event of NextAuth.js (shown above).

### Rules
- **Trigger**: New user registration.
- **Condition**: Email domain ends with `.ac.il` or `.edu`.
- **Action**: Set `isStudent = true` and `isPro = true`.
