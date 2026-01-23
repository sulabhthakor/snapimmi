'use server';

import { prisma } from "@/lib/prisma";
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from "date-fns";

export async function getRevenueStats(firmId: string) {
    const now = new Date();
    const startOfCurrentMonth = startOfMonth(now);
    const startOfLastMonth = startOfMonth(subMonths(now, 1));
    const endOfLastMonth = endOfMonth(subMonths(now, 1));

    // 1. Total Revenue (Paid Payments)
    const totalRevenueAgg = await prisma.payment.aggregate({
        where: {
            firmId,
            status: 'COMPLETED'
        },
        _sum: { amount: true }
    });
    const totalRevenue = totalRevenueAgg._sum.amount?.toNumber() || 0;

    // 2. Pending Invoices
    const pendingAgg = await prisma.payment.aggregate({
        where: {
            firmId,
            status: 'PENDING'
        },
        _sum: { amount: true },
        _count: { id: true }
    });
    const pendingAmount = pendingAgg._sum.amount?.toNumber() || 0;
    const pendingCount = pendingAgg._count.id || 0;

    // 3. Average Deal Size (Completed Payments)
    const avgDealAgg = await prisma.payment.aggregate({
        where: {
            firmId,
            status: 'COMPLETED'
        },
        _avg: { amount: true }
    });
    const avgDealSize = avgDealAgg._avg.amount?.toNumber() || 0;

    // 4. Comparison with Last Month
    const currentMonthRevenue = await prisma.payment.aggregate({
        where: {
            firmId,
            status: 'COMPLETED',
            paidAt: { gte: startOfCurrentMonth }
        },
        _sum: { amount: true }
    });

    const lastMonthRevenue = await prisma.payment.aggregate({
        where: {
            firmId,
            status: 'COMPLETED',
            paidAt: { gte: startOfLastMonth, lte: endOfLastMonth }
        },
        _sum: { amount: true }
    });

    const currentMonthVal = currentMonthRevenue._sum.amount?.toNumber() || 0;
    const lastMonthVal = lastMonthRevenue._sum.amount?.toNumber() || 0;

    let growth = 0;
    if (lastMonthVal > 0) {
        growth = ((currentMonthVal - lastMonthVal) / lastMonthVal) * 100;
    } else if (currentMonthVal > 0) {
        growth = 100; // 100% growth if started from 0
    }

    return {
        totalRevenue,
        pendingAmount,
        pendingCount,
        avgDealSize,
        monthlyGrowth: growth
    };
}

export async function getRecentTransactions(
    firmId: string,
    filters?: {
        status?: string;
        dateFrom?: string;
        dateTo?: string;
        limit?: number;
    }
) {
    const { status, dateFrom, dateTo, limit = 10 } = filters || {};

    const where: any = { firmId };

    // Status filter
    if (status) {
        where.status = status;
    }

    // Date range filter
    if (dateFrom || dateTo) {
        where.createdAt = {};
        if (dateFrom) where.createdAt.gte = new Date(dateFrom);
        if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    const payments = await prisma.payment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: {
            application: {
                include: {
                    customer: true
                }
            }
        }
    });

    return payments.map(p => ({
        id: p.id,
        customerId: p.application.customerId,
        applicationId: p.application.id,
        customerName: p.application.customer.fullName,
        customerAvatar: p.application.customer.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
        service: `${p.application.visaType} - ${p.application.targetCountry}`,
        amount: p.amount.toNumber(),
        method: p.method,
        status: p.status,
        date: format(p.createdAt, 'MMM d, yyyy')
    }));
}

export async function getRevenueChartData(firmId: string) {
    const end = new Date();
    const start = subMonths(end, 5); // Last 6 months

    const payments = await prisma.payment.groupBy({
        by: ['createdAt'], // Ideally groupBy month, but Prisma doesn't support date extraction in groupBy easily across DBs.
        // So we fetch simplified data or user distinct approach.
        // For simplicity with Prisma Postgres, we can fetch all paid payments in range and aggregate in JS, 
        // or use raw query for performance. 
        // Let's use JS aggregation for now as data volume is likely low.
        where: {
            firmId,
            status: 'COMPLETED',
            createdAt: { gte: start }
        }
    });

    // Actually, getting all payments might be heavy. Let's do raw query for monthly sum? 
    // Or just fetch ID, amount, date.
    const rawPayments = await prisma.payment.findMany({
        where: {
            firmId,
            status: 'COMPLETED',
            createdAt: { gte: start }
        },
        select: {
            amount: true,
            createdAt: true
        }
    });

    const months = eachMonthOfInterval({ start, end });

    const data = months.map(month => {
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);

        const monthlySum = rawPayments
            .filter(p => p.createdAt >= monthStart && p.createdAt <= monthEnd)
            .reduce((sum, p) => sum + p.amount.toNumber(), 0);

        return {
            month: format(month, 'MMM'),
            revenue: monthlySum
        };
    });

    return data;
}

export async function exportTransactionsCSV(
    firmId: string,
    filters?: {
        status?: string;
        dateFrom?: string;
        dateTo?: string;
    }
) {
    // Get all matching transactions (no limit for export)
    const transactions = await getRecentTransactions(firmId, { ...filters, limit: 1000 });

    // CSV headers
    const headers = ['Date', 'Customer', 'Service', 'Amount (INR)', 'Method', 'Status', 'Receipt #'];

    // CSV rows
    const rows = transactions.map(t => [
        t.date,
        t.customerName,
        t.service,
        t.amount.toFixed(2),
        t.method,
        t.status,
        '' // Receipt # - not currently tracked
    ]);

    // Combine headers and rows
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csvContent;
}

export async function getPaymentDetails(paymentId: string) {
    const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: {
            application: {
                include: {
                    customer: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true,
                            phone: true
                        }
                    }
                }
            }
        }
    });

    if (!payment) return null;

    // Serialize Decimal
    return {
        ...payment,
        amount: payment.amount.toNumber(),
        application: {
            ...payment.application,
            customer: payment.application.customer
        }
    };
}

export async function updatePayment(data: {
    id: string;
    amount?: number;
    method?: string;
    status?: string;
    notes?: string;
    paidAt?: Date;
}) {
    try {
        const updated = await prisma.payment.update({
            where: { id: data.id },
            data: {
                ...(data.amount !== undefined && { amount: data.amount }),
                ...(data.method && { method: data.method as any }),
                ...(data.status && { status: data.status as any }),
                ...(data.notes !== undefined && { notes: data.notes }),
                ...(data.paidAt && { paidAt: data.paidAt })
            }
        });

        return { success: true, payment: { ...updated, amount: updated.amount.toNumber() } };
    } catch (error) {
        console.error('Update payment error:', error);
        return { success: false, error: 'Failed to update payment' };
    }
}

export async function refundPayment(paymentId: string, reason?: string) {
    try {
        // Update payment status to REFUNDED
        const payment = await prisma.payment.update({
            where: { id: paymentId },
            data: {
                status: 'REFUNDED',
                notes: reason ? `REFUNDED: ${reason}` : 'REFUNDED'
            }
        });

        // TODO: Create separate refund record if needed
        // TODO: Update application's total paid amount

        return { success: true, payment: { ...payment, amount: payment.amount.toNumber() } };
    } catch (error) {
        console.error('Refund payment error:', error);
        return { success: false, error: 'Failed to process refund' };
    }
}
