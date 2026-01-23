import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function main() {
    let output = '--- DEBUG INFO ---\n';

    // 1. Check Firms
    const firms = await prisma.firm.findMany({
        include: {
            _count: {
                select: { customers: true, applications: true, users: true }
            }
        }
    });
    output += `1. FIRMS found: ${firms.length}\n`;
    firms.forEach(f => {
        output += `[FIRM] Name: ${f.name}, Slug: ${f.slug}, ID: ${f.id}\n`;
        output += `       Counts: ${f._count.users} Users, ${f._count.customers} Customers, ${f._count.applications} Apps\n`;
    });

    // 2. Check Specific User
    const email = 'owner@globalvisa.com';
    const owner = await prisma.user.findUnique({
        where: { email }
    });

    if (owner) {
        output += `\n2. USER (${email})\n`;
        output += `   ID: ${owner.id}\n`;
        output += `   FirmID: ${owner.firmId}\n`;

        // Check if linked firm exists
        const usersFirm = firms.find(f => f.id === owner.firmId);
        if (!usersFirm) {
            output += `   ⚠️ WARNING: User is linked to FirmID ${owner.firmId} which does NOT exist in the list above!\n`;
        } else {
            output += `   ✅ User linked to valid firm: ${usersFirm.name}\n`;
        }

        if (owner.firmId !== firms[0]?.id) {
            output += `   ❌ ID MISMATCH: User FirmID (${owner.firmId}) !== First Firm ID (${firms[0]?.id})\n`;
        }

    } else {
        output += `\n2. USER (${email}) NOT FOUND\n`;
    }

    fs.writeFileSync('debug-output.txt', output);
    console.log('Debug info written to debug-output.txt');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
