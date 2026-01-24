'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { updateSystemSettings } from '@/features/admin/system-settings-actions';
import { toast } from 'sonner';
import { Megaphone, X, Save, Loader2 } from 'lucide-react';

interface SystemNotificationsProps {
    settings: {
        systemBannerText: string | null;
    } | null;
}

export function SystemNotifications({ settings }: SystemNotificationsProps) {
    const [bannerText, setBannerText] = useState(settings?.systemBannerText || '');
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const result = await updateSystemSettings({ systemBannerText: bannerText || null });
            if (result.success) {
                toast.success(bannerText ? 'System banner updated' : 'System banner removed');
            } else {
                toast.error('Failed to update banner');
            }
        } catch (e) {
            toast.error('An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = async () => {
        setBannerText('');
        // Optional: Auto-save on clear? Or let user click save. Let's let user click save for confirmation.
    };

    return (
        <Card className="border-blue-200 bg-blue-50/30">
            <CardHeader>
                <div className="flex items-center gap-2 text-blue-800">
                    <Megaphone className="h-5 w-5" />
                    <CardTitle className="text-lg">System Banner</CardTitle>
                </div>
                <CardDescription>
                    Display a global announcement to all users (e.g., maintenance schedules, critical alerts).
                    Leave empty to hide the banner.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSave} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="banner-text">Announcement Message</Label>
                        <div className="flex gap-2">
                            <Input
                                id="banner-text"
                                placeholder="e.g., Scheduled maintenance on Saturday, 10 PM UTC."
                                value={bannerText}
                                onChange={(e) => setBannerText(e.target.value)}
                                disabled={isLoading}
                                className="flex-1"
                            />
                            {bannerText && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleClear}
                                    disabled={isLoading}
                                    title="Clear text"
                                >
                                    <X className="h-4 w-4 text-gray-500" />
                                </Button>
                            )}
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white">
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            {bannerText ? 'Publish Banner' : 'Remove Banner'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
