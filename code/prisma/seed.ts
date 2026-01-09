import { PrismaClient, Role, FirmStatus, AppStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Create Super Admin
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@snapdecode.in' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'admin@snapdecode.in',
      password: adminPassword,
      role: Role.SUPER_ADMIN,
      isActive: true,
    },
  });
  console.log('✅ Super Admin created: admin@snapdecode.in / Admin@123');

  // 2. Create Demo Firm
  const firm = await prisma.firm.upsert({
    where: { slug: 'demo-global' },
    update: {},
    create: {
      name: 'Global Visa Consultants',
      slug: 'demo-global',
      email: 'contact@globalvisa.com',
      subscriptionPlan: 'PREMIUM',
      status: FirmStatus.ACTIVE,
    },
  });
  console.log(`🏢 Demo Firm created: ${firm.name}`);

  // 3. Create Firm Owner
  const ownerPassword = await bcrypt.hash('Owner@123', 10);
  const firmOwner = await prisma.user.upsert({
    where: { email: 'owner@globalvisa.com' },
    update: {},
    create: {
      name: 'Rahul Patel',
      email: 'owner@globalvisa.com',
      password: ownerPassword,
      role: Role.FIRM_OWNER,
      isActive: true,
      firmId: firm.id,
    },
  });
  console.log('✅ Firm Owner created: owner@globalvisa.com / Owner@123');

  // 4. Create Agent
  const agentPassword = await bcrypt.hash('Agent@123', 10);
  const agent = await prisma.user.upsert({
    where: { email: 'agent@globalvisa.com' },
    update: {},
    create: {
      name: 'Priya Sharma',
      email: 'agent@globalvisa.com',
      password: agentPassword,
      role: Role.AGENT,
      isActive: true,
      firmId: firm.id,
    },
  });
  console.log('✅ Agent created: agent@globalvisa.com / Agent@123');

  // 5. Create Mock Customers
  const customerNames = [
    'Aarav Patel', 'Vivaan Singh', 'Aditya Sharma', 'Vihaan Gupta', 'Arjun Kumar',
    'Sai Reddy', 'Reyansh Mishra', 'Ayaan Verma', 'Krishna Mehta', 'Ishaan Joshi',
    'Diya Malhotra', 'Ananya Iyer', 'Saanvi Nair', 'Pari Khan', 'Myra Chatterjee'
  ];

  const customers = [];
  console.log('🌱 Seeding Customers...');

  for (const name of customerNames) {
    const firstName = name.split(' ')[0].toLowerCase();
    const customer = await prisma.customer.create({
      data: {
        firmId: firm.id,
        fullName: name,
        email: `${firstName}@example.com`,
        phone: `+91 98${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
        passportMeta: `A${Math.floor(Math.random() * 9000000) + 1000000}`,
      },
    });
    customers.push(customer);

    // Create Passport Relation
    const issueDate = new Date();
    issueDate.setFullYear(issueDate.getFullYear() - Math.floor(Math.random() * 5));
    const expiryDate = new Date(issueDate);
    expiryDate.setFullYear(expiryDate.getFullYear() + 10);

    await prisma.passport.create({
      data: {
        customerId: customer.id,
        number: customer.passportMeta!,
        country: 'India',
        issueDate: issueDate,
        expiryDate: expiryDate,
      }
    });
  }
  console.log(`✅ ${customers.length} Customers created.`);

  // 6. Create Mock Applications
  const visaTypes = ['Student Visa', 'Tourist Visa', 'Work Permit', 'PR Application', 'Business Visa'];
  const countries = ['Canada', 'USA', 'UK', 'Australia', 'Germany', 'Dubai'];
  const priorities = ['HIGH', 'MEDIUM', 'LOW'];
  const statuses = [AppStatus.LEAD, AppStatus.DOCS_COLLECTED, AppStatus.APPLIED, AppStatus.APPROVED, AppStatus.REJECTED];

  console.log('🌱 Seeding Applications...');

  for (const customer of customers) {
    // Create 1-2 applications per customer
    const numApps = Math.floor(Math.random() * 2) + 1;

    for (let i = 0; i < numApps; i++) {
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      await prisma.application.create({
        data: {
          firmId: firm.id,
          customerId: customer.id,
          targetCountry: countries[Math.floor(Math.random() * countries.length)],
          visaType: visaTypes[Math.floor(Math.random() * visaTypes.length)],
          status: status,
          priority: priorities[Math.floor(Math.random() * priorities.length)],
          notes: `System generated application mock data.`,
        }
      });
    }
  }
  console.log('✅ Applications seeded.');

  // 7. Create Mock Documents (Metadata only)
  console.log('🌱 Seeding Documents...');

  for (const customer of customers) {
    await prisma.document.create({
      data: {
        customerId: customer.id,
        name: 'Passport_Front.jpg',
        category: 'PASSPORT',
        fileUrl: '#',
        fileSize: 1024 * 1024 * 2,
        mimeType: 'image/jpeg'
      }
    });
  }
  console.log('✅ Documents seeded.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
