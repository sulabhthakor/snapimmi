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
        <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Settings</h1>
                <p className="mt-2 text-base text-gray-600">Manage your profile, security, and team preferences.</p>
            </div>

            <div className="flex flex-col gap-8">
                {/* Horizontal Navigation (Tabs) */}
                <div className="flex items-center gap-4 border-b border-gray-200 pb-1 overflow-x-auto sticky top-16 bg-gray-50 z-30 pt-2">
                    <a href="#profile" className="flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 border-transparent hover:border-black hover:text-black text-gray-500 transition-all whitespace-nowrap">
                        <User className="h-4 w-4" />
                        Profile
                    </a>
                    <a href="#security" className="flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 border-transparent hover:border-black hover:text-black text-gray-500 transition-all whitespace-nowrap">
                        <Shield className="h-4 w-4" />
                        Security
                    </a>
                    <a href="#team" className="flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 border-transparent hover:border-black hover:text-black text-gray-500 transition-all whitespace-nowrap">
                        <Users className="h-4 w-4" />
                        Team
                    </a>
                </div>

                {/* Main Content Area */}
                <div className="space-y-16 max-w-4xl pb-20">
                    {/* Profile Section */}
                    <div id="profile" className="scroll-mt-32">
                        <div className="mb-6 flex items-center gap-3">
                            <div className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm">
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
                    <div id="security" className="scroll-mt-32">
                        <div className="mb-6 flex items-center gap-3">
                            <div className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm">
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

                    {/* Team Section */}
                    <div id="team" className="scroll-mt-32">
                        <div className="mb-6 flex items-center gap-3">
                            <div className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm">
                                <Users className="h-5 w-5 text-gray-900" />
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
