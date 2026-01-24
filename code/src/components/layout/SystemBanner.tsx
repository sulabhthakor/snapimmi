import { getSystemSettings } from "@/features/admin/system-settings-actions";
import { Megaphone } from "lucide-react";

export async function SystemBanner() {
    const settings = await getSystemSettings();

    if (!settings || !settings.systemBannerText) {
        return null;
    }

    return (
        <div className="bg-blue-600 text-white px-4 py-2 text-sm font-medium text-center">
            <div className="flex items-center justify-center gap-2">
                <Megaphone className="h-4 w-4" />
                <span>{settings.systemBannerText}</span>
            </div>
        </div>
    );
}
