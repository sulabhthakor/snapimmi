import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"

import bcrypt from "bcryptjs"
import { authConfig } from "./auth.config"

import { prisma } from "@/lib/prisma";

async function getUser(email: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { email },
            include: { firm: true }
        });

        if (user) {
            // Flatten generic user object for NextAuth
            return {
                ...user,
                firmId: user.firmId,
                firmStatus: user.firm?.status,
                // @ts-ignore
                mustChangePassword: (user as any).mustChangePassword, // Include this flag
            } as any;
        }
        return null;
    } catch (error) {
        console.error('Failed to fetch user:', error);
        throw new Error('Failed to fetch user.');
    }
}

export const { auth, signIn, signOut, handlers } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            async authorize(credentials) {
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data;
                    const user = await getUser(email);
                    if (!user) return null;

                    const passwordsMatch = await bcrypt.compare(password, user.password);
                    if (passwordsMatch) return user;
                }

                console.log('Invalid credentials');
                return null;
            },
        }),
    ],
})
