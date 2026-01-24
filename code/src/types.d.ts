import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        user: {
            /** The user's firm ID. */
            firmId: string
            /** The user's role. */
            role: string
            /** The user's firm status. */
            firmStatus: string
        } & DefaultSession["user"]
    }

    interface User {
        firmId: string;
        role: string;
        firmStatus?: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        firmId: string
        role: string
        firmStatus?: string
    }
}
