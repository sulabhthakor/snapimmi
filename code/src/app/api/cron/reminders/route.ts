import { NextResponse } from 'next/server';
import { checkExpiringDocuments } from '@/lib/cron';

export const dynamic = 'force-dynamic'; // Prevent static caching

export async function GET(request: Request) {
    // 1. Verify Authentication (e.g. Cron Secret)
    // In production, check for auth header from Vercel Cron
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // 2. Run Logic
        const expiringItems = await checkExpiringDocuments();

        // 3. Process Notifications (Placeholder)
        // In real app: await sendEmails(expiringItems);
        console.log(`[CRON] Found ${expiringItems.length} expiring items.`);
        expiringItems.forEach(item => {
            console.log(`[NOTIFY] ALERT: ${item.customerName}'s ${item.type} expires in ${item.daysLeft} days! Phone: ${item.customerPhone}`);
            // Here we would insert into a 'Notification' table
        });

        return NextResponse.json({
            success: true,
            processed: expiringItems.length,
            items: expiringItems
        });

    } catch (error) {
        console.error('[CRON] Failed:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
