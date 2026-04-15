const bcrypt = require('bcryptjs');
const prisma = require('../src/config/prisma');

async function seed() {
  console.log('Seeding test users...');
  const passwordHash = await bcrypt.hash('password123', 10);
  
  // Seed Admin
  await prisma.user.upsert({
    where: { email: 'admin@careercove.com' },
    update: { isVerified: true, passwordHash },
    create: {
      email: 'admin@careercove.com',
      fullName: 'System Admin',
      passwordHash,
      role: 'ADMIN',
      isVerified: true
    }
  });

  // Seed Student
  const student = await prisma.user.upsert({
    where: { email: 'student@careercove.com' },
    update: { isVerified: true, passwordHash },
    create: {
      email: 'student@careercove.com',
      fullName: 'Test Student',
      passwordHash,
      role: 'STUDENT',
      isVerified: true
    }
  });

  await prisma.studentProfile.upsert({
    where: { userId: student.id },
    update: {},
    create: {
      userId: student.id,
      enrollmentNumber: 'ENR999999',
      department: 'Computer Science',
      batchYear: 2025,
      currentYear: 4,
      currentSemester: 8
    }
  });

  console.log('Test users injected successfully!');
}

seed().catch(console.error).finally(() => prisma.$disconnect());
