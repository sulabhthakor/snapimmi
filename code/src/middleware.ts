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

        // If admin (no firmId), allow access
        if (!firmId) return NextResponse.next()

        // Extract firmId from URL: /dashboard/[firmId]/...
        const pathFirmId = nextUrl.pathname.split("/")[2]

        if (pathFirmId && firmId !== pathFirmId) {
            // User is trying to access another firm's dashboard
            return NextResponse.redirect(new URL(`/dashboard/${firmId}`, nextUrl))
        }
    }

    return NextResponse.next()
})

export const config = {
    matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}
