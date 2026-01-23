import Link from 'next/link';
import { ArrowLeft, FileQuestion } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="text-center max-w-md mx-auto">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FileQuestion className="h-8 w-8 text-gray-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
                    <p className="text-gray-500 mb-8">
                        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                    </p>
                    <div className="flex flex-col gap-3">
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center justify-center px-4 py-2.5 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors w-full"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Return to Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
