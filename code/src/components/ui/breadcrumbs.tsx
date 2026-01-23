"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const routeMap: Record<string, string> = {
    dashboard: "Dashboard",
    customers: "Customers",
    applications: "Applications",
    documents: "Documents",
    tasks: "Tasks",
    payments: "Payments",
    "expiry-radar": "Expiry Radar",
    settings: "Settings",
};

export function Breadcrumbs({ className }: { className?: string }) {
    const pathname = usePathname();
    // Filter out empty strings and the firmId (assumed to be the 3rd segment usually, /dashboard/[firmId]/...)
    // Path usually: /dashboard/[firmId]/customers/....
    const segments = pathname.split("/").filter(Boolean);

    // We want to skip 'dashboard' and '[firmId]' for the visual breadcrumb often, OR keep them.
    // Let's assume segment[0] is dashboard, segment[1] is firmId.
    // We can start showing from Home -> ...

    if (segments.length < 2) return null;

    const firmId = segments[1];
    const relevantSegments = segments.slice(2); // Skip dashboard and firmId

    return (
        <nav aria-label="Breadcrumb" className={cn("flex items-center space-x-2 text-sm text-muted-foreground mb-6", className)}>
            <Link
                href={`/dashboard/${firmId}`}
                className="flex items-center hover:text-foreground transition-colors"
            >
                <Home className="h-4 w-4" />
            </Link>

            {relevantSegments.map((segment, index) => {
                const isLast = index === relevantSegments.length - 1;
                const path = `/dashboard/${firmId}/${relevantSegments.slice(0, index + 1).join("/")}`;

                let label = routeMap[segment] || segment;

                // If it looks like a UUID, replace with "Details"
                if (/^[0-9a-f]{8}-/i.test(label)) {
                    label = "Details";
                }

                return (
                    <div key={path} className="flex items-center">
                        <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground/50" />
                        {isLast ? (
                            <span className="font-medium text-foreground">{label}</span>
                        ) : (
                            <Link
                                href={path}
                                className="hover:text-foreground transition-colors"
                            >
                                {label}
                            </Link>
                        )}
                    </div>
                );
            })}
        </nav>
    );
}
