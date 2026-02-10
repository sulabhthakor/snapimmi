
import { PrismaClient, AppStatus } from '@prisma/client';

const prisma = new PrismaClient();
const FIRM_ID = 'b3cf1c6a-e951-4247-86e7-3ed191d12714';

async function main() {
    console.log(`Starting seed for Firm ID: ${FIRM_ID}...`);

    // Ensure firm exists or create a dummy one if it doesn't (though user said match existing)
    let firm = await prisma.firm.findUnique({ where: { id: FIRM_ID } });
    if (!firm) {
        console.log('Firm not found, ensuring it exists...');
        // We assume it exists based on user URL, but safety check:
        // checking if user meant us to create it? No, user gave a specific UUID, likely existing.
        // If it doesn't exist, we can't seed effectively without creating it.
        // Let's create it if missing for safety.
        firm = await prisma.firm.create({
            data: {
                id: FIRM_ID,
                name: 'Demo Immigration Firm',
                slug: 'demo-firm',
                email: 'demo@example.com',
                subscriptionPlan: 'PRO',
                status: 'ACTIVE',
            }
        });
    }

    // 1. Create Customers
    console.log('Creating Customers...');
    const customersData = [
        { fullName: 'Rahul Sharma', email: 'rahul.s@example.com', phone: '+919876543210' },
        { fullName: 'Priya Patel', email: 'priya.p@example.com', phone: '+919876543211' },
        { fullName: 'Amit Singh', email: 'amit.s@example.com', phone: '+919876543212' },
        { fullName: 'Sneha Gupta', email: 'sneha.g@example.com', phone: '+919876543213' },
        { fullName: 'Vikram Malhotra', email: 'vikram.m@example.com', phone: '+919876543214' },
        { fullName: 'Anjali Desai', email: 'anjali.d@example.com', phone: '+919876543215' },
        { fullName: 'Rohan Mehta', email: 'rohan.m@example.com', phone: '+919876543216' },
    ];

    const customers = [];
    for (const c of customersData) {
        const cust = await prisma.customer.create({
            data: {
                firmId: FIRM_ID,
                ...c,
            }
        });
        customers.push(cust);
    }

    // 2. Create Applications (Pipeline Data)
    console.log('Creating Applications...');
    const appStatuses: AppStatus[] = ['PENDING', 'DOCUMENTS_COLLECTED', 'APPLIED', 'APPROVED', 'PENDING', 'DOCUMENTS_COLLECTED', 'APPLIED', 'PENDING'];

    for (let i = 0; i < customers.length; i++) {
        const status = appStatuses[i % appStatuses.length];
        await prisma.application.create({
            data: {
                firmId: FIRM_ID,
                customerId: customers[i].id,
                targetCountry: i % 2 === 0 ? 'Canada' : 'USA',
                visaType: i % 2 === 0 ? 'Study Permit' : 'Tourist Visa',
                status: status,
                priority: 'MEDIUM'
            }
        });
    }

    // 3. Create Recent Activity (Documents)
    console.log('Creating Documents...');
    for (let i = 0; i < 5; i++) {
        await prisma.document.create({
            data: {
                customerId: customers[i].id,
                name: `Passport_Front_${i}.jpg`,
                category: 'ID_PROOF',
                fileUrl: 'https://example.com/dummy.jpg', // Dummy URL
                fileSize: 1024 * (i + 1),
                mimeType: 'image/jpeg',
            }
        });
    }

    // 4. Create Expiry Data (Passports)
    console.log('Creating Expiring Items...');
    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setDate(today.getDate() + 25); // Expiring soon

    await prisma.passport.create({
        data: {
            customerId: customers[0].id,
            number: 'X1234567',
            country: 'India',
            issueDate: new Date('2015-01-01'),
            expiryDate: nextMonth,
        }
    });

    console.log('Seed completed successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
