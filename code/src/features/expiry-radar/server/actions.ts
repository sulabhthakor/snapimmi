'use server';

import { checkExpiringDocuments } from "@/lib/cron";
import { auth } from "@/auth";

export async function getExpiringItems(firmId: string) {
    const session = await auth();
    // @ts-ignore
    if (!session?.user?.firmId || session.user.firmId !== firmId) {
        return [];
    }

    // Reuse shared logic
    const results = await checkExpiringDocuments(firmId);

    // Map to the view format if slightly different, or return as is.
    // The current view expects slightly distinct fields or ID format?
    // ExpiryResult has: firmId, customerName, type, expiryDate(Date), daysLeft, docId.
    // The original getExpiringItems returned: { id, customerId, customerName, type, detail, expiryDate(string), daysLeft }

    // We need to map it back to preserve UI contract.
    return results.map(item => ({
        id: item.docId,
        customerId: item.customerId,
        customerName: item.customerName,
        type: item.type,
        detail: `${item.type} expiring`,
        expiryDate: item.expiryDate.toISOString().split('T')[0],
        daysLeft: item.daysLeft
    }));
}
