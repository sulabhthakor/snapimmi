import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileForm } from "@/components/admin/settings/ProfileForm";
import { auth } from "@/auth";
import { getSystemSettings } from "@/features/admin/system-settings-actions";
import { PlatformControls } from "@/components/admin/settings/PlatformControls";
import { SystemNotifications } from "@/components/admin/settings/SystemNotifications";

export default async function AdminSettingsPage() {
    const session = await auth();
    // Default fallback if somehow no session, though middleware protects this
    const user = {
        name: session?.user?.name || '',
        email: session?.user?.email || '',
    };

    const settings = await getSystemSettings();

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">System Settings</h1>
                <p className="text-muted-foreground mt-2">Configure platform-wide parameters and manage your profile.</p>
            </div>

            <Tabs defaultValue="profile" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="profile">Admin Profile</TabsTrigger>
                    <TabsTrigger value="system">Platform Controls</TabsTrigger>
                    <TabsTrigger value="notifications">System Notifications</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-4">
                    <ProfileForm user={user} />
                </TabsContent>

                <TabsContent value="system">
                    <PlatformControls settings={settings} />
                </TabsContent>



                <TabsContent value="notifications">
                    <SystemNotifications settings={settings} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
