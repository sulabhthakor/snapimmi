import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { format } from 'date-fns';

async function getMasterData() {
    const countries = await prisma.country.findMany({
        include: {
            _count: {
                select: { visaTypes: true }
            }
        },
        orderBy: { name: 'asc' }
    });
    return countries;
}

export default async function MasterDataPage() {
    const countries = await getMasterData();

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Master Data</h1>
                    <p className="text-muted-foreground mt-2">Manage global settings used across all firms.</p>
                </div>
                <Link href="/dashboard/admin/master-data/new">
                    <Button className="bg-black hover:bg-gray-800 text-white gap-2">
                        <Globe className="h-4 w-4" />
                        Add Country
                    </Button>
                </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {countries.map((country) => (
                    <Link href={`/dashboard/admin/master-data/${country.id}`} key={country.id}>
                        <Card className="hover:shadow-md transition-all cursor-pointer group">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardTitle className="text-lg font-bold flex items-center gap-2">
                                    <span className="text-2xl">{getFlagEmoji(country.code)}</span>
                                    {country.name}
                                </CardTitle>
                                <div className="h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                                    <Globe className="h-4 w-4 text-gray-500" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-sm text-gray-500 mb-4">
                                    Code: <span className="font-mono bg-gray-100 px-1 rounded">{country.code}</span>
                                </div>
                                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                    <div className="flex items-center gap-1.5 text-sm font-medium text-gray-900">
                                        <BookOpen className="h-4 w-4 text-indigo-500" />
                                        {country._count.visaTypes} Visa Types
                                    </div>
                                    <span className="text-xs text-gray-400">
                                        {format(new Date(country.updatedAt), 'MMM d')}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}

// Helper for flags
function getFlagEmoji(countryCode: string) {
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
}
