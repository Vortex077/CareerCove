const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

const DEMO_PASSWORD = "Demo@1234";

async function main() {
  console.log("\n🔑  Creating demo accounts...\n");

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  // ─── Demo Student ──────────────────────────────────────────
  const studentEmail = "demo.student@university.edu";
  let student = await prisma.user.findUnique({
    where: { email: studentEmail },
  });

  if (!student) {
    student = await prisma.user.create({
      data: {
        email: studentEmail,
        passwordHash,
        fullName: "Demo Student",
        role: "STUDENT",
        isVerified: true,
        isActive: true,
        studentProfile: {
          create: {
            enrollmentNumber: "DEMO-STU-001",
            department: "Computer Science",
            batchYear: 2025,
            currentYear: 4,
            currentSemester: 8,
            cgpa: 8.0,
            activeBacklogs: 0,
            skills: ["React", "Node.js", "Python", "PostgreSQL", "Git"],
            programmingLanguages: ["JavaScript", "Python", "Java"],
            phone: "+91 9876543210",
            isPlaced: false,
          },
        },
      },
      include: { studentProfile: true },
    });
    console.log(`  ✓ Created: ${studentEmail} (STUDENT)`);
  } else {
    console.log(`  ↳ Already exists: ${studentEmail}`);
  }

  // ─── Demo Admin / T&P Coordinator ──────────────────────────
  const adminEmail = "demo.admin@university.edu";
  let admin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!admin) {
    admin = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        fullName: "Demo Admin",
        role: "ADMIN",
        isVerified: true,
        isActive: true,
      },
    });
    console.log(`  ✓ Created: ${adminEmail} (ADMIN)`);
  } else {
    console.log(`  ↳ Already exists: ${adminEmail}`);
  }

  // ─── Summary ───────────────────────────────────────────────
  console.log("\n" + "═".repeat(50));
  console.log("✅  Demo accounts ready!\n");
  console.log(`  Student: ${studentEmail}`);
  console.log(`  Admin:   ${adminEmail}`);
  console.log(`  Password: ${DEMO_PASSWORD}`);
  console.log("\n" + "═".repeat(50) + "\n");
}

main()
  .catch((e) => {
    console.error("\n❌ Error:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
