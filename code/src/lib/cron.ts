import { prisma } from "@/lib/prisma";
import { addDays, startOfDay, endOfDay } from "date-fns";

export type ExpiryResult = {
    firmId: string;
    customerId: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    type: 'Passport' | 'Visa';
    expiryDate: Date;
    daysLeft: number;
    docId: string;
};

export async function checkExpiringDocuments(firmId?: string) {
    const today = new Date();

    // Define thresholds
    const targets = [30, 60, 90];
    const results: ExpiryResult[] = [];

    // 1. Check Passports
    for (const days of targets) {
        const targetDateStart = startOfDay(addDays(today, days));
        const targetDateEnd = endOfDay(addDays(today, days));

        const where: any = {
            expiryDate: {
                gte: targetDateStart,
                lte: targetDateEnd
            },
            customer: { deletedAt: null }
        };

        if (firmId) {
            where.customer.firmId = firmId;
        }

        const passports = await prisma.passport.findMany({
            where,
            include: { customer: true }
        });

        passports.forEach(p => {
            results.push({
                firmId: p.customer.firmId,
                customerId: p.customerId,
                customerName: p.customer.fullName,
                customerEmail: p.customer.email || '',
                customerPhone: p.customer.phone || '',
                type: 'Passport',
                expiryDate: p.expiryDate,
                daysLeft: days,
                docId: `passport-${p.id}`
            });
        });

        // 2. Check Visas
        const visaWhere: any = {
            expiryDate: {
                gte: targetDateStart,
                lte: targetDateEnd
            },
            status: { equals: 'Active', mode: 'insensitive' },
            customer: { deletedAt: null }
        };

        if (firmId) {
            visaWhere.customer.firmId = firmId;
        }

        const visas = await prisma.visa.findMany({
            where: visaWhere,
            include: { customer: true }
        });

        visas.forEach(v => {
            results.push({
                firmId: v.customer.firmId,
                customerId: v.customerId,
                customerName: v.customer.fullName,
                customerEmail: v.customer.email || '',
                customerPhone: v.customer.phone || '',
                type: 'Visa',
                expiryDate: v.expiryDate,
                daysLeft: days,
                docId: `visa-${v.id}`
            });
        });
    }

    return results.sort((a, b) => a.daysLeft - b.daysLeft);
}
