
import { prisma } from './src/lib/prisma';

async function main() {
    const customerId = '92ba99be-18b8-4d53-905e-0e50bd1044a8';

    console.log(`Updating customer ${customerId} with dummy images...`);

    try {
        // Update Passport
        const passport = await prisma.passport.findFirst({ where: { customerId } });
        if (passport) {
            await prisma.passport.update({
                where: { id: passport.id },
                data: {
                    frontImage: 'https://placehold.co/600x400/png?text=Passport+Front',
                    backImage: 'https://placehold.co/600x400/png?text=Passport+Back'
                }
            });
            console.log('Passport updated with dummy images.');
        } else {
            console.log('No passport found to update.');
        }

        // Update Visa
        const visa = await prisma.visa.findFirst({ where: { customerId } });
        if (visa) {
            await prisma.visa.update({
                where: { id: visa.id },
                data: {
                    fileUrl: 'https://placehold.co/600x400/png?text=Visa+Document'
                }
            });
            console.log('Visa updated with dummy images.');
        } else {
            console.log('No visa found to update.');
        }

    } catch (e) {
        console.error('Error updating customer:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
