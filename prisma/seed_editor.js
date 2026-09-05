const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Ensuring default Editor account exists...');

  const passwordHash = await bcrypt.hash('Editor@123', 10);

  const editor = await prisma.user.upsert({
    where: { email: 'editor@dainikmanyavar.in' },
    update: {
      role: 'EDITOR',
      active: true,
    },
    create: {
      email: 'editor@dainikmanyavar.in',
      password: passwordHash,
      name: 'संपादक डेस्क (News Editor)',
      role: 'EDITOR',
      active: true,
    },
  });

  console.log('Editor account ready:', editor.email, 'Role:', editor.role);
}

main()
  .catch((e) => {
    console.error('Error seeding editor:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
