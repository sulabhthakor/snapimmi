import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Clock, Banknote } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

async function getCountry(id: string) {
    return await prisma.country.findUnique({
        where: { id },
        include: {
            visaTypes: {
                orderBy: { name: 'asc' }
            }
        }
    });
}

export default async function CountryDetailPage({ params }: { params: { countryId: string } }) {
    const { countryId } = await params;
    const country = await getCountry(countryId);

    if (!country) notFound();

    return (
        <div className="space-y-8">
            <div>
                <Link href="/dashboard/admin/master-data" className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1 mb-4">
                    <ArrowLeft className="h-3 w-3" /> Back to Master Data
                </Link>
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
                        <span className="text-4xl">{getFlagEmoji(country.code)}</span>
                        {country.name}
                        <span className="text-lg font-normal text-muted-foreground ml-2">({country.code})</span>
                    </h1>
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Visa Type
                    </Button>
                </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="font-semibold text-gray-900">Visa Types Configuration</h2>
                </div>
                <table className="w-full text-sm text-left">
                    <thead className="bg-white text-gray-500 font-medium border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4">Visa Name</th>
                            <th className="px-6 py-4">Category</th>
                            <th className="px-6 py-4">Processing Time</th>
                            <th className="px-6 py-4">Govt Fee</th>
                            <th className="px-6 py-4">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {country.visaTypes.map((visa) => (
                            <tr key={visa.id} className="hover:bg-gray-50/50">
                                <td className="px-6 py-4 font-medium text-gray-900">{visa.name}</td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                                        {visa.category}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-gray-500">
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="h-3 w-3" />
                                        {visa.processingTime || 'N/A'}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-500">
                                    <div className="flex items-center gap-1.5">
                                        <Banknote className="h-3 w-3" />
                                        {visa.currency} {visa.governmentFee?.toString()}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {visa.isActive ? (
                                        <span className="text-green-600 font-medium text-xs">Active</span>
                                    ) : (
                                        <span className="text-gray-400 font-medium text-xs">Inactive</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {country.visaTypes.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                    No visa types configured for this country yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function getFlagEmoji(countryCode: string) {
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
}
