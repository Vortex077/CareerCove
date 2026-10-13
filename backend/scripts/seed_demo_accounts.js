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

  // ─── Demo T&P Coordinator ──────────────────────────────────
  const tnpEmail = "demo.tnp@university.edu";
  let tnp = await prisma.user.findUnique({ where: { email: tnpEmail } });

  if (!tnp) {
    tnp = await prisma.user.create({
      data: {
        email: tnpEmail,
        passwordHash,
        fullName: "Demo T&P Coordinator",
        role: "TNP_COORDINATOR",
        isVerified: true,
        isActive: true,
      },
    });
    console.log(`  ✓ Created: ${tnpEmail} (TNP_COORDINATOR)`);
  } else {
    // Ensure role and password match expected values
    await prisma.user.update({
      where: { id: tnp.id },
      data: { role: "TNP_COORDINATOR", passwordHash }
    });
    console.log(`  ↳ Updated: ${tnpEmail} (TNP_COORDINATOR)`);
  }

  // ─── Summary ───────────────────────────────────────────────
  console.log("\n" + "═".repeat(50));
  console.log("✅  Demo accounts ready!\n");
  console.log(`  Student:          ${studentEmail}`);
  console.log(`  T&P Coordinator:  ${tnpEmail}`);
  console.log(`  Password:         ${DEMO_PASSWORD}`);
  console.log("\n" + "═".repeat(50) + "\n");
}

main()
  .catch((e) => {
    console.error("\n❌ Error:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
