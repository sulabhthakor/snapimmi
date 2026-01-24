import NextAuth from "next-auth"
import { authConfig } from "@/auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
    const { nextUrl } = req
    const isLoggedIn = !!req.auth
    const isAuthRoute = nextUrl.pathname.startsWith("/api/auth") || nextUrl.pathname === "/login"
    const isDashboardRoute = nextUrl.pathname.startsWith("/dashboard")

    console.log(`MW: Path=${nextUrl.pathname}, LoggedIn=${isLoggedIn}, FirmID=${(req.auth?.user as any)?.firmId}`)

    if (isAuthRoute) {
        if (isLoggedIn && nextUrl.pathname === "/login") {
            const firmId = (req.auth?.user as any).firmId
            if (!firmId) {
                return NextResponse.redirect(new URL("/dashboard/admin", nextUrl))
            }
            return NextResponse.redirect(new URL(`/dashboard/${firmId}`, nextUrl))
        }
        return NextResponse.next()
    }

    if (isDashboardRoute) {
        if (!isLoggedIn) {
            return NextResponse.redirect(new URL("/login", nextUrl))
        }

        // Tenant Isolation
        const firmId = (req.auth?.user as any).firmId
        const firmStatus = (req.auth?.user as any).firmStatus

        // If admin (no firmId), allow access
        if (!firmId) return NextResponse.next()

        // 🚨 SECURITY: Check Firm Status
        if (firmStatus === 'SUSPENDED' || firmStatus === 'PENDING_VERIFICATION') {
            return NextResponse.redirect(new URL("/login?error=AccountSuspended", nextUrl))
        }

        // 🔒 SECURITY: Enforce Password Change
        const mustChangePassword = (req.auth?.user as any).mustChangePassword;
        if (mustChangePassword) {
            return NextResponse.redirect(new URL("/change-password", nextUrl));
        }

        // Extract firmId from URL: /dashboard/[firmId]/...
        const pathFirmId = nextUrl.pathname.split("/")[2]

        if (pathFirmId && firmId !== pathFirmId) {
            // User is trying to access another firm's dashboard
            return NextResponse.redirect(new URL(`/dashboard/${firmId}`, nextUrl))
        }
    }

    // Protect /change-password route - require login
    if (nextUrl.pathname === '/change-password') {
        if (!isLoggedIn) {
            return NextResponse.redirect(new URL("/login", nextUrl));
        }
        // Assuming if they are here, they are allowed to be here regardless of other states
        // But if they DON'T need to change password, maybe redirect to dashboard?
        const mustChangePassword = (req.auth?.user as any).mustChangePassword;
        if (!mustChangePassword) {
            // Optional: Redirect to dashboard if they stumble here by accident?
            // Or allow them to change password willingly.
            // If manual change allowed, keep it. But for now, let's allow it.
        }
    }

    return NextResponse.next()
})

export const config = {
    matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}
