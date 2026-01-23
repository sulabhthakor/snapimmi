'use server';

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function getExpiringItems(firmId: string) {
    const session = await auth();
    // @ts-ignore
    if (!session?.user?.firmId || session.user.firmId !== firmId) {
        return [];
    }

    const today = new Date();
    const ninetyDaysFromNow = new Date();
    ninetyDaysFromNow.setDate(today.getDate() + 90);

    // Fetch expiring passports
    const expiringPassports = await prisma.passport.findMany({
        where: {
            customer: {
                firmId: firmId,
                deletedAt: null
            },
            expiryDate: {
                gte: today,
                lte: ninetyDaysFromNow
            }
        },
        include: {
            customer: {
                select: {
                    id: true,
                    fullName: true
                }
            }
        },
        orderBy: {
            expiryDate: 'asc'
        }
    });

    // Fetch expiring visas
    const expiringVisas = await prisma.visa.findMany({
        where: {
            customer: {
                firmId: firmId,
                deletedAt: null
            },
            expiryDate: {
                gte: today,
                lte: ninetyDaysFromNow
            },
            status: 'Active'
        },
        include: {
            customer: {
                select: {
                    id: true,
                    fullName: true
                }
            }
        },
        orderBy: {
            expiryDate: 'asc'
        }
    });

    // Combine and format
    const passportItems = expiringPassports.map(p => ({
        id: `passport-${p.id}`,
        customerId: p.customerId,
        customerName: p.customer.fullName,
        type: 'Passport' as const,
        detail: `${p.country} Passport`,
        expiryDate: p.expiryDate.toISOString().split('T')[0],
        daysLeft: Math.ceil((p.expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    }));

    const visaItems = expiringVisas.map(v => ({
        id: `visa-${v.id}`,
        customerId: v.customerId,
        customerName: v.customer.fullName,
        type: 'Visa' as const,
        detail: `${v.country} - ${v.type}`,
        expiryDate: v.expiryDate.toISOString().split('T')[0],
        daysLeft: Math.ceil((v.expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    }));

    return [...passportItems, ...visaItems].sort((a, b) => a.daysLeft - b.daysLeft);
}
