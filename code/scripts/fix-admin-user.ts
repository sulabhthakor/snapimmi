
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixAdminUser() {
    console.log('🔍 Checking for broken Super Admin users...');

    // Find all super admins
    const admins = await prisma.user.findMany({
        where: { role: 'SUPER_ADMIN' }
    });

    console.log(`Found ${admins.length} Super Admin(s).`);

    for (const admin of admins) {
        if (admin.firmId) {
            console.log(`❌ Admin ${admin.email} has broken state: firmId=${admin.firmId}`);
            console.log('🛠️ Fixing...');

            await prisma.user.update({
                where: { id: admin.id },
                data: { firmId: null }
            });

            console.log(`✅ Admin ${admin.email} fixed. (firmId set to null)`);
        } else {
            console.log(`✅ Admin ${admin.email} is in correct state.`);
        }
    }
}

fixAdminUser()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
