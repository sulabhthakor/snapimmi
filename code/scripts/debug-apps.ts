
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const firmId = 'b4aa7252-8efc-488f-970c-020bdb4325e6';
    const customerId = '8645075c-5305-45db-b785-828e74a02ef4';

    console.log(`Checking data for Firm: ${firmId}, Customer: ${customerId}`);

    const customer = await prisma.customer.findUnique({
        where: { id: customerId }
    });
    console.log('Customer exists:', !!customer, customer?.fullName);

    if (customer) {
        console.log('Customer FirmID:', customer.firmId);
        console.log('Match?', customer.firmId === firmId);
    }

    const apps = await prisma.application.findMany({
        where: {
            firmId: firmId,
            customerId: customerId
        }
    });

    console.log('Applications found count:', apps.length);
    console.log('Applications:', JSON.stringify(apps, null, 2));

    if (apps.length === 0) {
        console.log('No applications found. Creating a sample application...');
        await prisma.application.create({
            data: {
                firmId,
                customerId,
                targetCountry: 'Canada',
                visaType: 'Student Visa',
                status: 'LEAD',
                priority: 'MEDIUM',
                notes: 'Sample application created by debug script'
            }
        });
        console.log('Sample application created.');
    } else {
        console.log('Applications exist.');
    }

    // Check all apps for this firm to see if IDs are different
    const allFirmApps = await prisma.application.findMany({
        where: { firmId }
    });
    console.log('Total apps for firm:', allFirmApps.length);
    if (allFirmApps.length > 0) {
        console.log('Sample app customerId:', allFirmApps[0].customerId);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
