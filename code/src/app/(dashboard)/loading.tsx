import { Loader2 } from "lucide-react";

export default function Loading() {
    return (
        <div className="h-full w-full flex flex-col items-center justify-center min-h-[50vh] gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-gray-300" />
            <p className="text-sm text-gray-400 font-medium animate-pulse">Loading dashboard...</p>
        </div>
    );
}
