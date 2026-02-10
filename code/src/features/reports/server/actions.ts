'use server';

import { prisma } from "@/lib/prisma";
import { format } from "date-fns";

// Helper to escape CSV fields
const escapeCsv = (field: any) => {
    if (field === null || field === undefined) return '';
    const stringField = String(field);
    if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
        return `"${stringField.replace(/"/g, '""')}"`;
    }
    return stringField;
};

export async function generateCustomerReport(firmId: string, from?: string, to?: string) {
    const whereClause: any = { firmId, deletedAt: null };

    if (from || to) {
        whereClause.createdAt = {};
        if (from) whereClause.createdAt.gte = new Date(from);
        if (to) whereClause.createdAt.lte = new Date(to);
    }

    const customers = await prisma.customer.findMany({
        where: whereClause,
        include: {
            _count: {
                select: { applications: true, documents: true }
            },
            familyGroup: true
        },
        orderBy: { createdAt: 'desc' }
    });

    const headers = ['Full Name', 'Email', 'Phone', 'Family Group', 'Applications', 'Documents', 'Created At'];

    const rows = customers.map(c => [
        c.fullName,
        c.email,
        c.phone,
        c.familyGroup?.name || 'Individual',
        c._count.applications,
        c._count.documents,
        format(c.createdAt, 'yyyy-MM-dd')
    ]);

    const csvContent = [
        headers.map(escapeCsv).join(','),
        ...rows.map(row => row.map(escapeCsv).join(','))
    ].join('\n');

    return { filename: `customers_${format(new Date(), 'yyyy-MM-dd')}.csv`, content: csvContent };
}

export async function generateFinancialReport(firmId: string, from?: string, to?: string) {
    const whereClause: any = { firmId, status: 'COMPLETED' };

    if (from || to) {
        whereClause.paidAt = {};
        if (from) whereClause.paidAt.gte = new Date(from);
        if (to) whereClause.paidAt.lte = new Date(to);
    }

    const payments = await prisma.payment.findMany({
        where: whereClause,
        include: {
            application: {
                include: { customer: true }
            }
        },
        orderBy: { paidAt: 'desc' }
    });

    const headers = ['Receipt No', 'Date', 'Customer', 'Service', 'Amount', 'Method', 'Notes'];

    const rows = payments.map(p => [
        p.receiptNumber || p.id.substring(0, 8),
        p.paidAt ? format(p.paidAt, 'yyyy-MM-dd') : '',
        p.application.customer.fullName,
        `${p.application.visaType} - ${p.application.targetCountry}`,
        p.amount.toString(),
        p.method,
        p.notes
    ]);

    const csvContent = [
        headers.map(escapeCsv).join(','),
        ...rows.map(row => row.map(escapeCsv).join(','))
    ].join('\n');

    return { filename: `financials_${format(new Date(), 'yyyy-MM-dd')}.csv`, content: csvContent };
}

export async function generateApplicationsReport(firmId: string, from?: string, to?: string) {
    const whereClause: any = { firmId, deletedAt: null };

    if (from || to) {
        whereClause.createdAt = {};
        if (from) whereClause.createdAt.gte = new Date(from);
        if (to) whereClause.createdAt.lte = new Date(to);
    }

    const apps = await prisma.application.findMany({
        where: whereClause,
        include: {
            customer: true
        },
        orderBy: { updatedAt: 'desc' }
    });

    const headers = ['ID', 'Customer', 'Country', 'Visa Type', 'Status', 'Priority', 'Created At'];

    const rows = apps.map(a => [
        a.id.substring(0, 8),
        a.customer.fullName,
        a.targetCountry,
        a.visaType,
        a.status,
        a.priority,
        format(a.createdAt, 'yyyy-MM-dd')
    ]);

    const csvContent = [
        headers.map(escapeCsv).join(','),
        ...rows.map(row => row.map(escapeCsv).join(','))
    ].join('\n');

    return { filename: `applications_${format(new Date(), 'yyyy-MM-dd')}.csv`, content: csvContent };
}
