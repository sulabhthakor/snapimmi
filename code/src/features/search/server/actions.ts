'use server';

import { prisma } from '@/lib/prisma';

export async function globalSearch(firmId: string | undefined, query: string) {
    if (!firmId || !query || query.length < 2) return null;

    const [customers, applications, documents] = await Promise.all([
        prisma.customer.findMany({
            where: {
                firmId,
                deletedAt: null,
                OR: [
                    { fullName: { contains: query, mode: 'insensitive' } },
                    { email: { contains: query, mode: 'insensitive' } },
                    { phone: { contains: query, mode: 'insensitive' } }
                ]
            },
            take: 5,
            select: { id: true, fullName: true, email: true, phone: true }
        }),
        prisma.application.findMany({
            where: {
                firmId,
                deletedAt: null,
                OR: [
                    { visaType: { contains: query, mode: 'insensitive' } },
                    { targetCountry: { contains: query, mode: 'insensitive' } },
                    { customer: { fullName: { contains: query, mode: 'insensitive' } } }
                ]
            },
            take: 5,
            include: { customer: { select: { fullName: true } } }
        }),
        prisma.document.findMany({
            where: {
                customer: { firmId },
                deletedAt: null,
                name: { contains: query, mode: 'insensitive' }
            },
            take: 5,
            include: { customer: { select: { fullName: true } } }
        })
    ]);

    return {
        customers: customers.map(c => ({
            type: 'CUSTOMER',
            id: c.id,
            title: c.fullName,
            subtitle: c.email || c.phone,
            url: `/dashboard/${firmId}/customers/${c.id}`
        })),
        applications: applications.map(a => ({
            type: 'APPLICATION',
            id: a.id,
            title: `${a.visaType} - ${a.targetCountry}`,
            subtitle: a.customer.fullName,
            url: `/dashboard/${firmId}/applications/${a.id}` // NOTE: We created this page!
        })),
        documents: documents.map(d => ({
            type: 'DOCUMENT',
            id: d.id,
            title: d.name,
            subtitle: d.customer.fullName,
            url: d.fileUrl // Or maybe detail view? For now direct link or vault.
            // If vault: `/dashboard/${firmId}/documents?search=${d.name}`
        }))
    };
}
