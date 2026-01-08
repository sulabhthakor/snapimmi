import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"
import bcrypt from "bcryptjs"
import db from "@/lib/db"

// Notice we don't import db here for the edge-safe config used by middleware
// IF we need to use db in authorize, we might need a separate strategy or use the 'authorize' 
// function in the non-edge file, but Credentials provider usually needs Node.
// HOWEVER, Middleware ONLY needs to know if session exists.
// The actual login (authorize) happens on server (Node).

// Strategy:
// 1. Define the config minus the providers that need Node (like Credentials with huge libs or DB)
// 2. But Credentials provider IS needed for login.
// 3. For middleware, we can use a stripped down version?

// Actually, NextAuth v5 pattern:
// auth.config.ts exports the config object.
// auth.ts exports the NextAuth instance.

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id;
                // @ts-ignore
                token.firmId = user.firmId;
                // @ts-ignore
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                // @ts-ignore
                session.user.id = token.id;
                // @ts-ignore
                session.user.firmId = token.firmId;
                // @ts-ignore
                session.user.role = token.role;
            }
            return session;
        },
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
            if (isOnDashboard) {
                if (isLoggedIn) return true;
                return false; // Redirect unauthenticated users to login page
            }
            return true;
        },
    },
    providers: [], // Providers added in auth.ts
} satisfies NextAuthConfig;
