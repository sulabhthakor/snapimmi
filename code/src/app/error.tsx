'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="text-center max-w-md mx-auto">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="h-8 w-8 text-red-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong!</h1>
                    <p className="text-gray-500 mb-8">
                        We apologize for the inconvenience. An unexpected error has occurred.
                    </p>

                    {process.env.NODE_ENV === 'development' && (
                        <div className="mb-8 p-4 bg-gray-50 rounded-lg text-left overflow-auto max-h-48 text-xs font-mono text-red-600 border border-red-100">
                            {error.message || "Unknown error"}
                        </div>
                    )}

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={reset}
                            className="inline-flex items-center justify-center px-4 py-2.5 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors w-full"
                        >
                            <RefreshCcw className="mr-2 h-4 w-4" />
                            Try again
                        </button>
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center justify-center px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors w-full"
                        >
                            <Home className="mr-2 h-4 w-4" />
                            Go to Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
