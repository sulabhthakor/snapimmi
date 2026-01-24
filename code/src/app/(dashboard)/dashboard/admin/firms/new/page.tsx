'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Building2, ArrowLeft, Loader2, CheckCircle2, Copy, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { createFirm } from '@/features/admin/actions';
import { toast } from 'sonner';

export default function NewFirmPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [manualSlug, setManualSlug] = useState(false);

    // New state for success credentials
    const [createdCredentials, setCreatedCredentials] = useState<{
        email: string;
        tempPassword: string;
        firmName: string;
    } | null>(null);

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newName = e.target.value;
        setName(newName);

        // Auto-generate slug if user hasn't manually edited it
        if (!manualSlug) {
            const generatedSlug = newName
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with dashes
                .replace(/^-+|-+$/g, '');     // Trim leading/trailing dashes
            setSlug(generatedSlug);
        }
    };

    const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSlug(e.target.value);
        setManualSlug(true);
    };

    async function onSubmit(formData: FormData) {
        setIsLoading(true);
        setError('');

        try {
            const result = await createFirm(formData);
            if (result.success) {
                // Instead of redirecting, show credentials
                setCreatedCredentials({
                    email: result.email || '',
                    tempPassword: result.tempPassword || '',
                    firmName: result.firmName || ''
                });
                toast.success('Firm created successfully');
            } else {
                setError(result.error || 'Failed to create firm');
            }
        } catch (e) {
            setError('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard');
    };

    if (createdCredentials) {
        return (
            <div className="max-w-2xl mx-auto space-y-8">
                <div className="bg-white rounded-xl border border-green-200 shadow-sm p-8 text-center pt-12 pb-12">
                    <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="h-8 w-8" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-2">Firm Created Successfully!</h1>
                    <p className="text-gray-500 mb-8 max-w-md mx-auto">
                        <strong>{createdCredentials.firmName}</strong> has been onboarded.
                        Please share the following temporary credentials with the firm owner.
                    </p>

                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-8 text-left max-w-sm mx-auto">
                        <div className="space-y-1 mb-4">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</span>
                            <div className="flex items-center justify-between">
                                <code className="text-sm font-mono text-gray-900 bg-white px-2 py-1 rounded border border-gray-100 w-full mr-2">
                                    {createdCredentials.email}
                                </code>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyToClipboard(createdCredentials.email)}>
                                    <Copy className="h-4 w-4 text-gray-500" />
                                </Button>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Temporary Password</span>
                            <div className="flex items-center justify-between">
                                <code className="text-sm font-mono text-gray-900 bg-white px-2 py-1 rounded border border-gray-100 w-full mr-2">
                                    {createdCredentials.tempPassword}
                                </code>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyToClipboard(createdCredentials.tempPassword)}>
                                    <Copy className="h-4 w-4 text-gray-500" />
                                </Button>
                            </div>
                        </div>

                        <div className="mt-4 flex items-start gap-2 p-3 bg-amber-50 text-amber-800 text-xs rounded-lg border border-amber-100">
                            <AlertTriangle className="h-4 w-4 shrink-0" />
                            <p>This password will only be shown once. Please save it securely or share it immediately.</p>
                        </div>
                    </div>

                    <div className="flex justify-center gap-4">
                        <Link href="/dashboard/admin/firms">
                            <Button variant="outline">Back to Firms List</Button>
                        </Link>
                        <Link href={`/dashboard/admin/firms/${slug}`}>
                            <Button>View Firm Details</Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div>
                <Link href="/dashboard/admin/firms" className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1 mb-4">
                    <ArrowLeft className="h-3 w-3" /> Back to Firms
                </Link>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Create New Firm</h1>
                <p className="text-muted-foreground mt-2">Onboard a new organization to the platform.</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
                <form action={onSubmit} className="space-y-6">
                    {/* Firm Details */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-gray-100 mb-4">
                            <Building2 className="h-5 w-5 text-gray-500" />
                            <h2 className="text-lg font-semibold text-gray-900">Firm Details</h2>
                        </div>

                        <div className="grid gap-2">
                            <label className="text-sm font-medium text-gray-900">Firm Name</label>
                            <input
                                name="name"
                                value={name}
                                onChange={handleNameChange}
                                type="text"
                                required
                                placeholder="e.g. Acme Immigration Services"
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                            />
                        </div>

                        <div className="grid gap-2">
                            <label className="text-sm font-medium text-gray-900">Slug (URL)</label>
                            <input
                                name="slug"
                                value={slug}
                                onChange={handleSlugChange}
                                type="text"
                                required
                                placeholder="e.g. acme-immigration"
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                            />
                            <p className="text-xs text-gray-500">
                                Will be used for their custom domain: snapimmi.com/{slug || 'your-firm'}
                                <br />
                                <span className="text-gray-400 italic">If taken, a unique number will be appended automatically.</span>
                            </p>
                        </div>

                        <div className="grid gap-2">
                            <label className="text-sm font-medium text-gray-900">Owner Email</label>
                            <input
                                name="email"
                                type="email"
                                required
                                placeholder="owner@example.com"
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                            />
                            <p className="text-xs text-gray-500">We'll send an invite to this email to set up their password.</p>
                        </div>
                    </div>

                    {/* Subscription */}
                    <div className="space-y-4 pt-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium text-gray-900">Initial Plan</label>
                            <select
                                name="plan"
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all bg-white"
                            >
                                <option value="FREE">Free Trial</option>
                                <option value="PRO">Pro Plan</option>
                                <option value="ENTERPRISE">Enterprise</option>
                            </select>
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="pt-4">
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-black hover:bg-gray-800 text-white h-11 text-base"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating Firm...
                                </>
                            ) : (
                                'Create Firm'
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
