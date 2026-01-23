
import { prisma } from './src/lib/prisma';

async function main() {
    const customerId = '92ba99be-18b8-4d53-905e-0e50bd1044a8';

    try {
        const customer = await prisma.customer.findUnique({
            where: { id: customerId },
            include: {
                passports: true,
                visas: true
            }
        });

        if (!customer) {
            console.log('Customer NOT FOUND');
        } else {
            console.log('--- Passport Data ---');
            if (customer.passports.length > 0) {
                customer.passports.forEach((p, i) => {
                    console.log(`Passport ${i}: ID=${p.id}`);
                    console.log(`  FrontImage: ${p.frontImage ? 'PRESENT' : 'NULL'} (${p.frontImage})`);
                    console.log(`  BackImage: ${p.backImage ? 'PRESENT' : 'NULL'} (${p.backImage})`);
                });
            } else {
                console.log('No passports found.');
            }

            console.log('--- Visa Data ---');
            if (customer.visas.length > 0) {
                customer.visas.forEach((v, i) => {
                    console.log(`Visa ${i}: ID=${v.id}, Type=${v.type}, Status=${v.status}`);
                    console.log(`  FileUrl: ${v.fileUrl ? 'PRESENT' : 'NULL'} (${v.fileUrl})`);
                });
            } else {
                console.log('No visas found.');
            }
        }
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
