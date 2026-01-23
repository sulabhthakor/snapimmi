import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Create Super Admin
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@snapdecode.in' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'admin@snapdecode.in',
      password: adminPassword,
      role: 'SUPER_ADMIN' as any,
      isActive: true,
    },
  });
  console.log('✅ Super Admin: admin@snapdecode.in');

  // 2. Create Demo Firm
  const firm = await prisma.firm.upsert({
    where: { slug: 'demo-global' },
    update: {},
    create: {
      name: 'Global Visa Consultants',
      slug: 'demo-global',
      email: 'contact@globalvisa.com',
      subscriptionPlan: 'PREMIUM',
      status: 'ACTIVE' as any,
    },
  });
  console.log(`🏢 Firm: ${firm.name}`);

  // 3. Create Firm Users (Owner & Agent)
  const ownerPassword = await bcrypt.hash('Owner@123', 10);
  const owner = await prisma.user.upsert({
    where: { email: 'owner@globalvisa.com' },
    update: {
      firmId: firm.id, // FORCE UPDATE FIRM ID
    },
    create: {
      name: 'Rahul Patel',
      email: 'owner@globalvisa.com',
      password: ownerPassword,
      role: 'FIRM_OWNER' as any,
      isActive: true,
      firmId: firm.id,
    },
  });

  const agentPassword = await bcrypt.hash('Agent@123', 10);
  const agent = await prisma.user.upsert({
    where: { email: 'agent@globalvisa.com' },
    update: {
      firmId: firm.id, // FORCE UPDATE FIRM ID
    },
    create: {
      name: 'Priya Sharma',
      email: 'agent@globalvisa.com',
      password: agentPassword,
      role: 'AGENT' as any,
      isActive: true,
      firmId: firm.id,
    },
  });
  console.log('✅ Agents created');

  const agents = [owner, agent];

  // 4a. Create First Family Group
  const family = await prisma.familyGroup.create({
    data: {
      firmId: firm.id,
      name: 'The Singh Family',
    }
  });

  // 4b. Create Second Family Group
  const family2 = await prisma.familyGroup.create({
    data: {
      firmId: firm.id,
      name: 'The Mehta Family',
    }
  });

  // 5. Create Mock Customers
  const customerData = [
    { name: 'Aarav Patel', isFamily: false },
    { name: 'Vivaan Singh', isFamily: true, familyId: family.id, head: true }, // Family Head
    { name: 'Riya Singh', isFamily: true, familyId: family.id, head: false },  // Spouse
    { name: 'Arjun Singh', isFamily: true, familyId: family.id, head: false }, // Child
    { name: 'Aditya Sharma', isFamily: false },
    { name: 'Vihaan Gupta', isFamily: false },
    { name: 'Saanvi Nair', isFamily: false },
    { name: 'Ishaan Joshi', isFamily: false }, // Expiring Passport Candidate
    { name: 'Diya Malhotra', isFamily: false }, // Expiring Visa Candidate
    { name: 'Rajesh Mehta', isFamily: true, familyId: family2.id, head: true },
    { name: 'Suman Mehta', isFamily: true, familyId: family2.id, head: false },
    { name: 'Ananya Mehta', isFamily: true, familyId: family2.id, head: false },
  ];

  const customers = [];
  console.log('🌱 Seeding Customers & Families...');

  for (const c of customerData) {
    const firstName = c.name?.split(' ')[0].toLowerCase() || 'user';

    // Create Customer
    const customer = await prisma.customer.create({
      data: {
        firmId: firm.id,
        fullName: c.name,
        email: `${firstName}@example.com`,
        phone: `+91 98${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
        passportMeta: `Z${Math.floor(Math.random() * 9000000) + 1000000}`,
        familyGroupId: c.isFamily ? c.familyId : undefined,
        isFamilyHead: c.head || false,
      },
    });
    customers.push(customer);

    // Create Passport
    // Logic: Ishaan Joshi has expiring passport (in 30 days)
    let passportExpiry = new Date();
    if (c.name === 'Ishaan Joshi') {
      passportExpiry.setDate(passportExpiry.getDate() + 30);
    } else {
      passportExpiry.setFullYear(passportExpiry.getFullYear() + Math.floor(Math.random() * 10) + 1);
    }

    await prisma.passport.create({
      data: {
        customerId: customer.id,
        number: customer.passportMeta!,
        country: 'India',
        issueDate: new Date(new Date().setFullYear(new Date().getFullYear() - 2)),
        expiryDate: passportExpiry,
        placeOfIssue: 'Mumbai',
      }
    });

    // Create Visa (Randomly for some)
    // Logic: Diya Malhotra has expiring visa (in 45 days)
    if (Math.random() > 0.4 || c.name === 'Diya Malhotra') {
      let visaExpiry = new Date();
      if (c.name === 'Diya Malhotra') {
        visaExpiry.setDate(visaExpiry.getDate() + 45);
      } else {
        visaExpiry.setDate(visaExpiry.getDate() + Math.floor(Math.random() * 300) + 60);
      }

      await prisma.visa.create({
        data: {
          customerId: customer.id,
          country: ['Canada', 'USA', 'UK'][Math.floor(Math.random() * 3)],
          type: ['Student', 'Tourist', 'Work'][Math.floor(Math.random() * 3)],
          status: 'ACTIVE',
          expiryDate: visaExpiry,
          grantDate: new Date()
        }
      });
    }

    // Create Documents (Multiple for some users)
    const docCategories = ['ID_PROOF', 'FINANCIAL', 'EDUCATIONAL', 'LEGAL'];
    const docCount = Math.floor(Math.random() * 4) + 1; // 1 to 4 docs

    for (let i = 0; i < docCount; i++) {
      await prisma.document.create({
        data: {
          customerId: customer.id,
          name: `Doc_${i + 1}_${c.name.split(' ')[0]}.jpg`,
          category: docCategories[Math.floor(Math.random() * docCategories.length)] as any,
          fileUrl: 'https://placehold.co/600x400/png',
          fileSize: 1024 * (Math.floor(Math.random() * 500) + 100),
          mimeType: 'image/jpeg'
        }
      });
    }
  }

  // 6. Create Applications (Multiple per customer logic)
  console.log('🌱 Seeding Applications & Payments...');
  const visaTypes = ['Student Visa', 'Tourist Visa', 'Work Permit', 'PR Application'];
  const countries = ['Canada', 'USA', 'UK', 'Australia'];
  const appStatuses = ['PENDING', 'DOCUMENTS_COLLECTED', 'APPLIED', 'APPROVED', 'REJECTED'];

  for (const customer of customers) {
    // 70% chance to have at least one app
    if (Math.random() > 0.3) {
      // 30% chance to have TWO applications
      const appCount = Math.random() > 0.7 ? 2 : 1;

      for (let i = 0; i < appCount; i++) {
        const app = await prisma.application.create({
          data: {
            firmId: firm.id,
            customerId: customer.id,
            targetCountry: countries[Math.floor(Math.random() * countries.length)],
            visaType: visaTypes[Math.floor(Math.random() * visaTypes.length)],
            status: appStatuses[Math.floor(Math.random() * appStatuses.length)] as any,
            priority: ['HIGH', 'MEDIUM', 'LOW'][Math.floor(Math.random() * 3)],
            notes: `Generated via seed. App #${i + 1}`,
          }
        });

        // 7. Create Payments for Application
        if (Math.random() > 0.2) {
          await prisma.payment.create({
            data: {
              firmId: firm.id,
              applicationId: app.id,
              amount: Math.floor(Math.random() * 50000) + 5000,
              currency: 'INR',
              method: 'UPI',
              status: 'COMPLETED' as any,
              paidAt: new Date(),
            }
          });
        }

        // 8. Create Tasks for Application
        await prisma.task.create({
          data: {
            firmId: firm.id,
            customerId: customer.id, // Linked!
            applicationId: app.id,   // Linked!
            assignedTo: agents[Math.floor(Math.random() * agents.length)].id,
            title: `Follow up on ${app.visaType} (${app.targetCountry})`,
            status: Math.random() > 0.5 ? 'DONE' : 'TODO' as any,
            priority: 'MEDIUM',
            dueDate: new Date(new Date().setDate(new Date().getDate() + 2)), // Due in 2 days
          }
        });
      }
    }
  }

  // 9. Orphan Tasks (But linked to customer)
  console.log('🌱 Seeding General Tasks...');
  await prisma.task.create({
    data: {
      firmId: firm.id,
      customerId: customers[0].id,
      assignedTo: agent.id,
      title: 'Call regarding new policies',
      status: 'TODO' as any,
      priority: 'HIGH',
      dueDate: new Date(), // Due today
    }
  });

  console.log('✅ Database Seeded Successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
