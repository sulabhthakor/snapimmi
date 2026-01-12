import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ProfileForm } from "./components/profile-form";
import { SecurityForm } from "./components/security-form";
import { User, Lock, Shield } from 'lucide-react';

export default async function SettingsPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    return (
        <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Settings</h1>
                <p className="mt-2 text-base text-gray-600">Manage your profile, security, and account preferences.</p>
            </div>

            <div className="flex flex-col gap-8">
                {/* Horizontal Navigation (Tabs) */}
                <div className="flex items-center gap-4 border-b border-gray-200 pb-1 overflow-x-auto">
                    <button className="flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 border-black text-black whitespace-nowrap">
                        <User className="h-4 w-4" />
                        Profile
                        <span className="ml-1.5 bg-gray-100 text-gray-900 px-2 py-0.5 rounded-full text-xs font-semibold">Active</span>
                    </button>
                    <a href="#security" className="flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300 transition-colors whitespace-nowrap">
                        <Shield className="h-4 w-4" />
                        Security
                    </a>
                    <button className="flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 border-transparent text-gray-400 cursor-not-allowed whitespace-nowrap">
                        <Lock className="h-4 w-4" />
                        Team (Coming Soon)
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="space-y-10 max-w-4xl">
                    {/* Profile Section */}
                    <div id="profile" className="scroll-mt-6">
                        <div className="mb-6 flex items-center gap-3">
                            <div className="p-2 bg-gray-100 rounded-lg">
                                <User className="h-5 w-5 text-gray-900" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Personal Information</h2>
                                <p className="text-sm text-gray-500">Update your personal details here.</p>
                            </div>
                        </div>
                        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl p-6 sm:p-8">
                            <ProfileForm
                                user={{
                                    name: session.user.name || '',
                                    email: session.user.email || '',
                                }}
                            />
                        </div>
                    </div>

                    {/* Security Section */}
                    <div id="security" className="scroll-mt-6">
                        <div className="mb-6 flex items-center gap-3">
                            <div className="p-2 bg-gray-100 rounded-lg">
                                <Shield className="h-5 w-5 text-gray-900" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Password & Security</h2>
                                <p className="text-sm text-gray-500">Manage your password and security preferences.</p>
                            </div>
                        </div>
                        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl p-6 sm:p-8">
                            <SecurityForm />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
