'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { updateSystemSettings } from '@/features/admin/system-settings-actions';
import { toast } from 'sonner';
import { AlertTriangle, UserPlus } from 'lucide-react';

interface PlatformControlsProps {
    settings: {
        maintenanceMode: boolean;
        allowRegistrations: boolean;
    } | null;
}

export function PlatformControls({ settings }: PlatformControlsProps) {
    const [maintenanceMode, setMaintenanceMode] = useState(settings?.maintenanceMode ?? false);
    const [allowRegistrations, setAllowRegistrations] = useState(settings?.allowRegistrations ?? true);
    const [isLoading, setIsLoading] = useState(false);

    const handleMaintenanceToggle = async (checked: boolean) => {
        setMaintenanceMode(checked);
        setIsLoading(true);
        try {
            const result = await updateSystemSettings({ maintenanceMode: checked });
            if (result.success) {
                toast.success(`Maintenance mode ${checked ? 'enabled' : 'disabled'}`);
            } else {
                toast.error('Failed to update maintenance mode');
                setMaintenanceMode(!checked); // Revert
            }
        } catch (e) {
            toast.error('Error updating settings');
            setMaintenanceMode(!checked);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegistrationToggle = async (checked: boolean) => {
        setAllowRegistrations(checked);
        setIsLoading(true);
        try {
            const result = await updateSystemSettings({ allowRegistrations: checked });
            if (result.success) {
                toast.success(`Registrations ${checked ? 'enabled' : 'disabled'}`);
            } else {
                toast.error('Failed to update registration settings');
                setAllowRegistrations(!checked); // Revert
            }
        } catch (e) {
            toast.error('Error updating settings');
            setAllowRegistrations(!checked);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card className="border-amber-200 bg-amber-50/30">
                <CardHeader>
                    <div className="flex items-center gap-2 text-amber-800">
                        <AlertTriangle className="h-5 w-5" />
                        <CardTitle className="text-lg">Maintenance Mode</CardTitle>
                    </div>
                    <CardDescription>
                        When enabled, only Administrators can access the system. Firm users and customers will see a maintenance page.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                    <Label htmlFor="maintenance-mode" className="text-base font-medium text-gray-700">
                        Enable Maintenance Mode
                    </Label>
                    <Switch
                        id="maintenance-mode"
                        checked={maintenanceMode}
                        onCheckedChange={handleMaintenanceToggle}
                        disabled={isLoading}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <UserPlus className="h-5 w-5 text-gray-500" />
                        <CardTitle className="text-lg">Firm Registrations</CardTitle>
                    </div>
                    <CardDescription>
                        Control whether new firms can sign up for the platform.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                    <Label htmlFor="allow-registration" className="text-base font-medium text-gray-700">
                        Allow New Registrations
                    </Label>
                    <Switch
                        id="allow-registration"
                        checked={allowRegistrations}
                        onCheckedChange={handleRegistrationToggle}
                        disabled={isLoading}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
