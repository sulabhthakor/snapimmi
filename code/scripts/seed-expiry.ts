
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding expiry data...');

    // 1. Get the first firm (or create one if needed)
    let firm = await prisma.firm.findFirst();
    if (!firm) {
        console.log('No firm found, creating one...');
        firm = await prisma.firm.create({
            data: {
                name: 'Demo Firm',
                slug: 'demo-firm',
                email: 'demo@example.com',
                subscriptionPlan: 'PRO',
            }
        });
    }

    console.log(`Using firm: ${firm.name} (${firm.id})`);

    const today = new Date();

    // Helper to add days
    const addDays = (days: number) => {
        const date = new Date();
        date.setDate(today.getDate() + days);
        return date;
    }

    // 2. Create Customer with Expiring Passport (in 15 days)
    const customer1 = await prisma.customer.create({
        data: {
            firmId: firm.id,
            fullName: 'Sarah Passport-Expiring',
            email: 'sarah.exp@example.com',
            phone: '+15550101',
            passports: {
                create: {
                    number: 'A1234567',
                    country: 'USA',
                    issueDate: new Date('2015-01-01'),
                    expiryDate: addDays(15), // Expires in 15 days
                    placeOfIssue: 'Washington'
                }
            }
        }
    });
    console.log(`Created customer: ${customer1.fullName} with expiring passport`);

    // 3. Create Customer with Expiring Visa (in 45 days)
    const customer2 = await prisma.customer.create({
        data: {
            firmId: firm.id,
            fullName: 'Mike Visa-Expiring',
            email: 'mike.exp@example.com',
            phone: '+15550102',
            visas: {
                create: {
                    country: 'Canada',
                    type: 'Work Permit',
                    grantDate: new Date('2023-01-01'),
                    expiryDate: addDays(45), // Expires in 45 days
                    status: 'Active'
                }
            }
        }
    });
    console.log(`Created customer: ${customer2.fullName} with expiring visa`);

    console.log('✅ Seeding completed!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
