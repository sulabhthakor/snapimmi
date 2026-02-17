import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ProfileForm } from "./components/profile-form";
import { SecurityForm } from "./components/security-form";
import { TeamList } from "@/features/settings/components/TeamList";
import { getTeamMembers } from "@/features/settings/server/actions";
import { User, Lock, Shield, Users } from 'lucide-react';

export default async function SettingsPage({ params }: { params: Promise<{ firmId: string }> }) {
    const session = await auth();
    const { firmId } = await params;

    if (!session?.user) {
        redirect("/login");
    }

    // Fetch team members
    const members = await getTeamMembers(firmId);

    return (
        <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">Settings</h1>
                <p className="mt-1 text-sm sm:text-base text-gray-500">Manage your profile, security, and team preferences.</p>
            </div>

            <div className="flex flex-col gap-6 sm:gap-8">
                {/* Horizontal Navigation (Tabs) */}
                <div className="flex items-center gap-1 sm:gap-2 border-b border-gray-200 overflow-x-auto sticky top-16 bg-gray-50/95 backdrop-blur-md z-30 pt-2 pb-0 no-scrollbar">
                    <a href="#profile" className="flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 border-gray-900 text-gray-900 transition-all whitespace-nowrap">
                        <User className="h-4 w-4" />
                        Profile
                    </a>
                    <a href="#security" className="flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 border-transparent hover:border-gray-300 hover:text-gray-700 text-gray-500 transition-all whitespace-nowrap">
                        <Shield className="h-4 w-4" />
                        Security
                    </a>
                    <a href="#team" className="flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 border-transparent hover:border-gray-300 hover:text-gray-700 text-gray-500 transition-all whitespace-nowrap">
                        <Users className="h-4 w-4" />
                        Team
                    </a>
                </div>

                {/* Main Content Area */}
                <div className="space-y-12 sm:space-y-16 max-w-4xl pb-20">
                    {/* Profile Section */}
                    <div id="profile" className="scroll-mt-32">
                        <div className="mb-5 flex items-center gap-3">
                            <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg shadow-indigo-100">
                                <User className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Personal Information</h2>
                                <p className="text-sm text-gray-500">Update your personal details here.</p>
                            </div>
                        </div>
                        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-2xl p-5 sm:p-8">
                            <ProfileForm
                                user={{
                                    name: session.user.name || '',
                                    email: session.user.email || '',
                                }}
                            />
                        </div>
                    </div>

                    {/* Security Section */}
                    <div id="security" className="scroll-mt-32">
                        <div className="mb-5 flex items-center gap-3">
                            <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg shadow-emerald-100">
                                <Shield className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Password & Security</h2>
                                <p className="text-sm text-gray-500">Manage your password and security preferences.</p>
                            </div>
                        </div>
                        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-2xl p-5 sm:p-8">
                            <SecurityForm />
                        </div>
                    </div>

                    {/* Team Section */}
                    <div id="team" className="scroll-mt-32">
                        <div className="mb-5 flex items-center gap-3">
                            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-100">
                                <Users className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Team Management</h2>
                                <p className="text-sm text-gray-500">Invite and manage team members.</p>
                            </div>
                        </div>
                        <TeamList firmId={firmId} members={members} currentUserRole={session.user.role} />
                    </div>
                </div>
            </div>
        </div>
    );
}
