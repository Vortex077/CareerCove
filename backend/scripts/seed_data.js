/**
 * CareerCove — Comprehensive Seed Script
 * ----------------------------------------
 * Creates full mock data:
 *   • 1 Admin + 2 TNP Coordinators + 1 HOD
 *   • 10 Students with complete profiles
 *   • 8 Companies
 *   • 2 Placement Drives
 *   • 12 Jobs (linked to drives & companies)
 *   • 20 Applications with varied statuses
 *
 * Run: node scripts/seed_data.js
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();
const HASH  = (pwd) => bcrypt.hash(pwd, 10);
const PASSWORD = 'password123';

// ─── Helper: create or fetch by email ───────────────────────────────────────
async function upsertUser(email, data) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`  ↳ Already exists: ${email}`);
    return existing;
  }
  const user = await prisma.user.create({ data });
  console.log(`  ✓ Created: ${email} (${data.role})`);
  return user;
}

async function main() {
  console.log('\n🌱  CareerCove Seed — starting...\n');

  // ═══════════════════════════════════════════
  // 1. ADMIN / STAFF USERS
  // ═══════════════════════════════════════════
  console.log('━━ Staff accounts');

  const admin = await upsertUser('admin@careercove.com', {
    email: 'admin@careercove.com',
    passwordHash: await HASH(PASSWORD),
    fullName: 'Rajesh Kumar (Admin)',
    role: 'ADMIN',
    isVerified: true,
    isActive: true,
  });

  const tnp1 = await upsertUser('tnp1@careercove.com', {
    email: 'tnp1@careercove.com',
    passwordHash: await HASH(PASSWORD),
    fullName: 'Priya Sharma',
    role: 'TNP_COORDINATOR',
    isVerified: true,
    isActive: true,
  });

  const tnp2 = await upsertUser('tnp2@careercove.com', {
    email: 'tnp2@careercove.com',
    passwordHash: await HASH(PASSWORD),
    fullName: 'Amit Verma',
    role: 'TNP_COORDINATOR',
    isVerified: true,
    isActive: true,
  });

  const hod = await upsertUser('hod@careercove.com', {
    email: 'hod@careercove.com',
    passwordHash: await HASH(PASSWORD),
    fullName: 'Dr. Sunita Patel',
    role: 'HOD',
    isVerified: true,
    isActive: true,
  });

  // ═══════════════════════════════════════════
  // 2. COMPANIES
  // ═══════════════════════════════════════════
  console.log('\n━━ Companies');

  const companyData = [
    { name: 'Infosys Limited',         industry: 'Information Technology', website: 'https://infosys.com',    hrName: 'Ankita Rao',    hrEmail: 'hr@infosys.com' },
    { name: 'Tata Consultancy Services',industry: 'Information Technology', website: 'https://tcs.com',       hrName: 'Ravi Nair',     hrEmail: 'hr@tcs.com' },
    { name: 'Wipro Technologies',       industry: 'IT Services',            website: 'https://wipro.com',      hrName: 'Sneha Gupta',   hrEmail: 'hr@wipro.com' },
    { name: 'HCL Technologies',         industry: 'IT Services',            website: 'https://hcltech.com',    hrName: 'Manoj Tiwari',  hrEmail: 'hr@hcltech.com' },
    { name: 'Accenture India',          industry: 'Consulting',             website: 'https://accenture.com',  hrName: 'Deepa Menon',   hrEmail: 'hr@accenture.com' },
    { name: 'Google India',             industry: 'Technology',             website: 'https://google.com',     hrName: 'Kiran Bhat',    hrEmail: 'hr@google.com' },
    { name: 'Amazon Development Centre',industry: 'E-Commerce / Cloud',     website: 'https://amazon.in',      hrName: 'Pooja Singh',   hrEmail: 'hr@amazon.com' },
    { name: 'Deloitte India',           industry: 'Consulting / Finance',   website: 'https://deloitte.com',   hrName: 'Rahul Mehta',   hrEmail: 'hr@deloitte.com' },
  ];

  const companies = [];
  for (const c of companyData) {
    let company = await prisma.company.findFirst({ where: { name: c.name } });
    if (!company) {
      company = await prisma.company.create({
        data: { ...c, description: `${c.name} is a leading ${c.industry} company.`, addedBy: admin.id, isActive: true },
      });
      console.log(`  ✓ Company: ${c.name}`);
    } else {
      console.log(`  ↳ Exists: ${c.name}`);
    }
    companies.push(company);
  }

  // ═══════════════════════════════════════════
  // 3. PLACEMENT DRIVES
  // ═══════════════════════════════════════════
  console.log('\n━━ Placement Drives');

  let drive1 = await prisma.placementDrive.findFirst({ where: { title: 'Mega Tech Drive 2025' } });
  if (!drive1) {
    drive1 = await prisma.placementDrive.create({
      data: {
        title: 'Mega Tech Drive 2025',
        description: 'Annual mass recruitment drive for top IT companies targeting final year students.',
        driveType: 'FULL_TIME',
        academicYear: '2024-2025',
        startDate: new Date('2025-08-01'),
        endDate: new Date('2025-09-30'),
        status: 'ACTIVE',
        isActive: true,
        createdBy: tnp1.id,
      },
    });
    console.log('  ✓ Drive: Mega Tech Drive 2025');
  } else { console.log('  ↳ Exists: Mega Tech Drive 2025'); }

  let drive2 = await prisma.placementDrive.findFirst({ where: { title: 'Summer Internship Pool 2025' } });
  if (!drive2) {
    drive2 = await prisma.placementDrive.create({
      data: {
        title: 'Summer Internship Pool 2025',
        description: 'Pre-placement internship programme for 3rd year students across all departments.',
        driveType: 'INTERNSHIP',
        academicYear: '2024-2025',
        startDate: new Date('2025-05-01'),
        endDate: new Date('2025-07-31'),
        status: 'UPCOMING',
        isActive: true,
        createdBy: tnp2.id,
      },
    });
    console.log('  ✓ Drive: Summer Internship Pool 2025');
  } else { console.log('  ↳ Exists: Summer Internship Pool 2025'); }

  // ═══════════════════════════════════════════
  // 4. JOBS
  // ═══════════════════════════════════════════
  console.log('\n━━ Jobs');

  const jobsData = [
    // Full-time — Drive 1
    { title: 'Software Engineer', companyIdx: 0, type: 'FULL_TIME', location: 'Bengaluru, India', pkg: '6.5 LPA', cgpa: 6.5, backlogs: 0, driveId: drive1.id, postedBy: tnp1.id,
      desc: 'Build and maintain scalable web applications using modern technologies.' },
    { title: 'Systems Engineer', companyIdx: 1, type: 'FULL_TIME', location: 'Mumbai, India', pkg: '7 LPA', cgpa: 6.0, backlogs: 1, driveId: drive1.id, postedBy: tnp1.id,
      desc: 'Design, develop, and deploy enterprise systems for top Fortune 500 clients.' },
    { title: 'Project Engineer', companyIdx: 2, type: 'FULL_TIME', location: 'Pune, India', pkg: '5.5 LPA', cgpa: 6.0, backlogs: 1, driveId: drive1.id, postedBy: tnp1.id,
      desc: 'Collaborate with cross-functional teams to deliver high-quality software projects.' },
    { title: 'Technical Graduate', companyIdx: 3, type: 'FULL_TIME', location: 'Noida, India', pkg: '4.5 LPA', cgpa: 5.5, backlogs: 2, driveId: drive1.id, postedBy: tnp2.id,
      desc: 'Work on cutting-edge digital transformation projects for global enterprises.' },
    { title: 'Associate Software Engineer', companyIdx: 4, type: 'FULL_TIME', location: 'Hyderabad, India', pkg: '9 LPA', cgpa: 7.0, backlogs: 0, driveId: drive1.id, postedBy: tnp2.id,
      desc: 'Be part of Accenture\'s innovation hubs working on cloud and AI solutions.' },
    // Premium jobs — No drive
    { title: 'Software Development Engineer', companyIdx: 5, type: 'FULL_TIME', location: 'Hyderabad, India', pkg: '28 LPA', cgpa: 8.0, backlogs: 0, driveId: null, postedBy: tnp1.id,
      desc: 'Join Google\'s engineering team to build products used by billions of users worldwide.' },
    { title: 'SDE-1 (AWS)', companyIdx: 6, type: 'FULL_TIME', location: 'Bengaluru, India', pkg: '32 LPA', cgpa: 7.5, backlogs: 0, driveId: null, postedBy: tnp1.id,
      desc: 'Work on Amazon\'s cloud infrastructure and services serving millions of customers.' },
    { title: 'Analyst (Technology)', companyIdx: 7, type: 'FULL_TIME', location: 'Delhi, India', pkg: '11 LPA', cgpa: 7.0, backlogs: 0, driveId: null, postedBy: tnp2.id,
      desc: 'Drive technology consulting projects for Deloitte\'s enterprise clients.' },
    // Internships — Drive 2
    { title: 'Software Intern', companyIdx: 0, type: 'INTERNSHIP', location: 'Remote', pkg: '₹25,000/mo', cgpa: 6.0, backlogs: 1, driveId: drive2.id, postedBy: tnp2.id,
      desc: '6-month internship with opportunity for pre-placement offer.' },
    { title: 'Cloud Trainee', companyIdx: 6, type: 'INTERNSHIP', location: 'Bengaluru, India', pkg: '₹40,000/mo', cgpa: 7.0, backlogs: 0, driveId: drive2.id, postedBy: tnp2.id,
      desc: 'Gain hands-on experience with AWS services and cloud architecture.' },
    { title: 'Data Analyst Intern', companyIdx: 4, type: 'INTERNSHIP', location: 'Gurugram, India', pkg: '₹30,000/mo', cgpa: 6.5, backlogs: 0, driveId: drive2.id, postedBy: tnp1.id,
      desc: 'Work with large datasets and build dashboards using Power BI and Python.' },
    { title: 'DevOps Intern', companyIdx: 2, type: 'INTERNSHIP', location: 'Pune, India', pkg: '₹20,000/mo', cgpa: 5.5, backlogs: 1, driveId: drive2.id, postedBy: tnp1.id,
      desc: 'Learn CI/CD pipelines, Docker, Kubernetes, and cloud deployment workflows.' },
  ];

  const createdJobs = [];
  for (const j of jobsData) {
    let job = await prisma.job.findFirst({ where: { title: j.title, companyId: companies[j.companyIdx].id } });
    if (!job) {
      job = await prisma.job.create({
        data: {
          title: j.title,
          companyId: companies[j.companyIdx].id,
          driveId: j.driveId,
          jobType: j.type,
          location: j.location,
          packageInfo: j.pkg,
          minCgpa: j.cgpa,
          maxBacklogs: j.backlogs,
          shortDescription: j.desc,
          applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          status: 'published',
          publishedAt: new Date(),
          postedBy: j.postedBy,
          applicationMode: 'internal',
          allowedDepartments: ['Computer Science', 'Information Technology', 'Electronics & Communication'],
          allowedYears: [4],
        },
      });
      console.log(`  ✓ Job: ${j.title} @ ${companies[j.companyIdx].name}`);
    } else {
      console.log(`  ↳ Exists: ${j.title}`);
    }
    createdJobs.push(job);
  }

  // ═══════════════════════════════════════════
  // 5. STUDENTS
  // ═══════════════════════════════════════════
  console.log('\n━━ Students');

  const studentsData = [
    { email: 'arjun.sharma@student.edu',   name: 'Arjun Sharma',     enroll: '2021CS001', dept: 'Computer Science',            batch: 2025, cgpa: 8.7, skills: ['React', 'Node.js', 'Python', 'AWS'],          prog: ['JavaScript', 'Python', 'Java'], backlogs: 0, placed: false },
    { email: 'priya.patel@student.edu',    name: 'Priya Patel',      enroll: '2021IT002', dept: 'Information Technology',      batch: 2025, cgpa: 9.1, skills: ['Java', 'Spring Boot', 'MySQL', 'Docker'],      prog: ['Java', 'SQL', 'Python'],        backlogs: 0, placed: false },
    { email: 'rohan.verma@student.edu',    name: 'Rohan Verma',      enroll: '2021EC003', dept: 'Electronics & Communication', batch: 2025, cgpa: 7.4, skills: ['Embedded C', 'MATLAB', 'PCB Design'],          prog: ['C', 'C++', 'Python'],           backlogs: 0, placed: false },
    { email: 'ananya.gupta@student.edu',   name: 'Ananya Gupta',     enroll: '2021CS004', dept: 'Computer Science',            batch: 2025, cgpa: 8.2, skills: ['Machine Learning', 'Python', 'TensorFlow'],     prog: ['Python', 'R'],                  backlogs: 0, placed: false },
    { email: 'karthik.nair@student.edu',   name: 'Karthik Nair',     enroll: '2021IT005', dept: 'Information Technology',      batch: 2025, cgpa: 6.8, skills: ['React', 'Vue.js', 'CSS', 'Figma'],             prog: ['JavaScript', 'TypeScript'],     backlogs: 1, placed: false },
    { email: 'sneha.singh@student.edu',    name: 'Sneha Singh',       enroll: '2021CS006', dept: 'Computer Science',            batch: 2025, cgpa: 9.4, skills: ['Algorithms', 'Go', 'Kubernetes', 'GCP'],       prog: ['Go', 'Python', 'Java'],         backlogs: 0, placed: true,  placedAt: 'Google India',     placedPkg: 28 },
    { email: 'amol.desai@student.edu',     name: 'Amol Desai',        enroll: '2021ME007', dept: 'Mechanical Engineering',      batch: 2025, cgpa: 6.3, skills: ['AutoCAD', 'SolidWorks', 'ANSYS'],             prog: ['Python', 'MATLAB'],             backlogs: 2, placed: false },
    { email: 'divya.krishna@student.edu',  name: 'Divya Krishna',    enroll: '2021IT008', dept: 'Information Technology',      batch: 2025, cgpa: 7.9, skills: ['Data Analysis', 'SQL', 'Power BI', 'Excel'],    prog: ['Python', 'SQL', 'R'],           backlogs: 0, placed: false },
    { email: 'rahul.pandey@student.edu',   name: 'Rahul Pandey',     enroll: '2021CS009', dept: 'Computer Science',            batch: 2025, cgpa: 7.1, skills: ['Android', 'Kotlin', 'Firebase', 'REST APIs'],  prog: ['Kotlin', 'Java'],               backlogs: 1, placed: false },
    { email: 'meera.joshi@student.edu',    name: 'Meera Joshi',       enroll: '2021CS010', dept: 'Computer Science',            batch: 2025, cgpa: 8.5, skills: ['DevOps', 'Jenkins', 'Docker', 'Terraform'],   prog: ['Python', 'Bash', 'Go'],         backlogs: 0, placed: true,  placedAt: 'Amazon Development Centre', placedPkg: 32 },
  ];

  const students = [];
  for (const s of studentsData) {
    let user = await prisma.user.findUnique({ where: { email: s.email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: s.email,
          passwordHash: await HASH(PASSWORD),
          fullName: s.name,
          role: 'STUDENT',
          isVerified: true,
          isActive: true,
          studentProfile: {
            create: {
              enrollmentNumber: s.enroll,
              department: s.dept,
              batchYear: s.batch,
              currentYear: 4,
              currentSemester: 8,
              cgpa: s.cgpa,
              activeBacklogs: s.backlogs,
              skills: s.skills,
              programmingLanguages: s.prog,
              isPlaced: s.placed,
              placementCompany:  s.placed ? s.placedAt  : null,
              placementPackage:  s.placed ? s.placedPkg : null,
              placementDate:     s.placed ? new Date()  : null,
              phone: `+91 98${Math.floor(10000000 + Math.random() * 89999999)}`,
            },
          },
        },
        include: { studentProfile: true },
      });
      console.log(`  ✓ Student: ${s.name} (${s.dept}, CGPA: ${s.cgpa})`);
    } else {
      console.log(`  ↳ Exists: ${s.name}`);
    }
    students.push(user);
  }

  // ═══════════════════════════════════════════
  // 6. APPLICATIONS
  // ═══════════════════════════════════════════
  console.log('\n━━ Applications');

  // Map: [studentIndex, jobIndex, status]
  const appMatrix = [
    [0, 0, 'SHORTLISTED'],
    [0, 5, 'UNDER_REVIEW'],
    [0, 8, 'APPLIED'],
    [1, 0, 'INTERVIEW_SCHEDULED'],
    [1, 1, 'SHORTLISTED'],
    [1, 9, 'APPLIED'],
    [2, 2, 'APPLIED'],
    [2, 3, 'UNDER_REVIEW'],
    [3, 4, 'SHORTLISTED'],
    [3, 5, 'REJECTED'],
    [3, 10,'APPLIED'],
    [4, 0, 'UNDER_REVIEW'],
    [4, 8, 'APPLIED'],
    [5, 5, 'SELECTED'],  // Sneha placed at Google
    [7, 7, 'SHORTLISTED'],
    [7, 10,'APPLIED'],
    [8, 1, 'APPLIED'],
    [8, 11,'APPLIED'],
    [9, 6, 'SELECTED'],  // Meera placed at Amazon
    [9, 4, 'SHORTLISTED'],
  ];

  let appCreated = 0, appSkipped = 0;
  for (const [sIdx, jIdx, status] of appMatrix) {
    const studentUser    = students[sIdx];
    const job            = createdJobs[jIdx];
    if (!studentUser || !job) continue;

    // Get studentProfile
    const profile = await prisma.studentProfile.findUnique({ where: { userId: studentUser.id } });
    if (!profile) continue;

    const existing = await prisma.application.findUnique({
      where: { studentId_jobId: { studentId: profile.userId, jobId: job.id } },
    });

    if (!existing) {
      await prisma.application.create({
        data: {
          studentId: profile.userId,
          jobId: job.id,
          status,
          eligibilityStatus: 'approved',
          appliedAt: new Date(Date.now() - Math.floor(Math.random() * 14) * 24 * 60 * 60 * 1000),
        },
      });
      appCreated++;
    } else {
      appSkipped++;
    }
  }
  console.log(`  ✓ Applications created: ${appCreated}, skipped (existing): ${appSkipped}`);

  // ═══════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════
  console.log('\n' + '═'.repeat(50));
  console.log('✅  Seed complete!\n');
  console.log('Staff Logins (password: password123)');
  console.log('  admin@careercove.com        → ADMIN');
  console.log('  tnp1@careercove.com         → TNP_COORDINATOR');
  console.log('  tnp2@careercove.com         → TNP_COORDINATOR');
  console.log('  hod@careercove.com          → HOD');
  console.log('\nStudent Logins (password: password123)');
  studentsData.forEach(s => console.log(`  ${s.email.padEnd(34)} → STUDENT (CGPA: ${s.cgpa})`));
  console.log('═'.repeat(50) + '\n');
}

main()
  .catch(e => { console.error('\n❌ Seed error:', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
