import Link from "next/link";
import { Wrench } from "lucide-react";

export default function MaintenancePage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center space-y-6">
                <div className="mx-auto h-16 w-16 bg-amber-100 rounded-full flex items-center justify-center">
                    <Wrench className="h-8 w-8 text-amber-600" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-gray-900">System Maintenance</h1>
                    <p className="text-gray-500">
                        We are currently performing scheduled maintenance to improve our services. Please check back later.
                    </p>
                </div>

                <div className="pt-4 border-t border-gray-100">
                    <Link
                        href="/login"
                        className="text-sm text-gray-400 hover:text-gray-900 transition-colors"
                    >
                        Admin Login
                    </Link>
                </div>
            </div>

            <div className="mt-8 text-center space-y-2">
                <p className="text-xs text-gray-400">
                    SnapImmi &copy; {new Date().getFullYear()}
                </p>
            </div>
        </div>
    );
}
