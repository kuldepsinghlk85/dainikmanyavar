const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('--- SEEDING & VERIFYING REPORTER MODULE ---');

  const email = 'reporter@dainikmanyavar.in';
  const plainPassword = 'Reporter@123';
  const reporterId = 'DM-REP-101';
  const fullName = 'अमित कुमार शर्मा';

  // Check or create test reporter user
  let user = await prisma.user.findUnique({ where: { email } });
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  if (!user) {
    user = await prisma.user.create({
      data: {
        name: fullName,
        email,
        password: hashedPassword,
        role: 'REPORTER',
        active: true,
      },
    });
    console.log('Created User:', user.id, user.email);
  } else {
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword, role: 'REPORTER', active: true },
    });
    console.log('Updated User:', user.id, user.email);
  }

  // Check or create Author
  let author = await prisma.author.findFirst({ where: { name: fullName } });
  if (!author) {
    author = await prisma.author.create({
      data: {
        name: fullName,
        slug: 'amit-kumar-sharma',
        designation: 'जिला संवाददाता (जौनपुर ब्यूरो)',
        bio: 'वरिष्ठ पत्रकार एवं संवाददाता, दैनिक मान्यवर। राजनीति, अपराध और जनहित मुद्दों पर खोजी पत्रकारिता।',
        photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        city: 'जौनपुर',
      },
    });
    console.log('Created Author:', author.id);
  }

  // Check or create ReporterProfile
  let profile = await prisma.reporterProfile.findUnique({ where: { reporterId } });
  if (!profile) {
    profile = await prisma.reporterProfile.create({
      data: {
        userId: user.id,
        reporterId,
        fullName,
        designation: 'जिला संवाददाता',
        district: 'जौनपुर',
        mobileNumber: '9876543210',
        bio: 'वरिष्ठ पत्रकार एवं संवाददाता, दैनिक मान्यवर।',
        photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        authorId: author.id,
        active: true,
      },
    });
    console.log('Created Reporter Profile:', profile.id, profile.reporterId);
  } else {
    console.log('Reporter Profile already exists:', profile.id);
  }

  console.log('Reporter account ready:');
  console.log('Identifier:', email, 'or', reporterId);
  console.log('Password:', plainPassword);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
