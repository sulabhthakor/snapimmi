import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedMasterData() {
    console.log('🌍 Seeding Master Data...');

    const countries = [
        { name: 'Canada', code: 'CA' },
        { name: 'United States', code: 'US' },
        { name: 'United Kingdom', code: 'GB' },
        { name: 'Australia', code: 'AU' },
        { name: 'New Zealand', code: 'NZ' },
        { name: 'Germany', code: 'DE' },
        { name: 'France', code: 'FR' },
        { name: 'Ireland', code: 'IE' },
        { name: 'India', code: 'IN' },
        { name: 'United Arab Emirates', code: 'AE' }
    ];

    for (const c of countries) {
        const country = await prisma.country.upsert({
            where: { code: c.code },
            update: {},
            create: {
                name: c.name,
                code: c.code,
            }
        });
        console.log(`- ${c.name} (${c.code})`);

        // Common Visa Types
        if (c.code === 'CA') {
            await seedVisas(country.id, [
                { name: 'Study Permit', category: 'Education', processingTime: '8-12 weeks', governmentFee: 150, currency: 'CAD' },
                { name: 'Work Permit (PGWP)', category: 'Work', processingTime: '3-5 months', governmentFee: 255, currency: 'CAD' },
                { name: 'Visitor Visa', category: 'Tourist', processingTime: '2-4 weeks', governmentFee: 100, currency: 'CAD' },
            ]);
        } else if (c.code === 'US') {
            await seedVisas(country.id, [
                { name: 'F-1 Student Visa', category: 'Education', processingTime: '2-4 weeks', governmentFee: 185, currency: 'USD' },
                { name: 'H-1B Specialty Occupation', category: 'Work', processingTime: '3-6 months', governmentFee: 460, currency: 'USD' },
                { name: 'B1/B2 Visitor', category: 'Tourist', processingTime: '3-6 months', governmentFee: 185, currency: 'USD' },
            ]);
        }
    }

    console.log('✅ Master Data Seeded');
}

async function seedVisas(countryId: string, visas: any[]) {
    for (const v of visas) {
        await prisma.globalVisaType.create({
            data: {
                countryId,
                name: v.name,
                category: v.category,
                processingTime: v.processingTime,
                governmentFee: v.governmentFee,
                currency: v.currency
            }
        });
    }
}

seedMasterData()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
