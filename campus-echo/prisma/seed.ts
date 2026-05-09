import { PrismaClient, UserRole, PostType, PostStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Categories
  const categories = [
    { name: "Academics", slug: "academics", color: "#6366f1", icon: "BookOpen", description: "Course-related issues and suggestions" },
    { name: "Faculty", slug: "faculty", color: "#8b5cf6", icon: "Users", description: "Concerns about teaching staff" },
    { name: "Infrastructure", slug: "infrastructure", color: "#ec4899", icon: "Building", description: "Campus facilities and maintenance" },
    { name: "Hostel", slug: "hostel", color: "#f59e0b", icon: "Home", description: "Dormitory issues" },
    { name: "Cafeteria", slug: "cafeteria", color: "#10b981", icon: "Coffee", description: "Food and dining concerns" },
    { name: "Events", slug: "events", color: "#3b82f6", icon: "Calendar", description: "Campus events and activities" },
    { name: "Transport", slug: "transport", color: "#06b6d4", icon: "Bus", description: "Transportation issues" },
    { name: "Exams", slug: "exams", color: "#f43f5e", icon: "FileText", description: "Examination related matters" },
    { name: "Administration", slug: "administration", color: "#64748b", icon: "Briefcase", description: "Administrative processes" },
    { name: "Mental Health", slug: "mental-health", color: "#a78bfa", icon: "Heart", description: "Wellbeing and mental health support" },
    { name: "Harassment", slug: "harassment", color: "#ef4444", icon: "Shield", description: "Safety and harassment reports (confidential)" },
    { name: "Technical Issues", slug: "technical-issues", color: "#0ea5e9", icon: "Cpu", description: "IT and technical problems" },
    { name: "General", slug: "general", color: "#6b7280", icon: "MessageSquare", description: "General feedback" },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log("✅ Categories seeded");

  // Admin user
  const adminPassword = await bcrypt.hash("Admin@123456", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@campusecho.app" },
    update: {},
    create: {
      email: "admin@campusecho.app",
      passwordHash: adminPassword,
      role: UserRole.ADMIN,
      emailVerified: new Date(),
      anonymousAlias: "Admin#0001",
      anonymousSeed: "admin-seed-001",
    },
  });

  // Moderator user
  const modPassword = await bcrypt.hash("Mod@123456", 12);
  const moderator = await prisma.user.upsert({
    where: { email: "mod@campusecho.app" },
    update: {},
    create: {
      email: "mod@campusecho.app",
      passwordHash: modPassword,
      role: UserRole.MODERATOR,
      emailVerified: new Date(),
      anonymousAlias: "Mod#0001",
      anonymousSeed: "mod-seed-001",
    },
  });

  // Sample student users
  const studentPassword = await bcrypt.hash("Student@123", 12);
  const students = [];
  for (let i = 1; i <= 5; i++) {
    const student = await prisma.user.upsert({
      where: { email: `student${i}@campusecho.app` },
      update: {},
      create: {
        email: `student${i}@campusecho.app`,
        passwordHash: studentPassword,
        role: UserRole.STUDENT,
        emailVerified: new Date(),
        anonymousAlias: `Echo#${1000 + i}`,
        anonymousSeed: `student-seed-00${i}`,
      },
    });
    students.push(student);
  }
  console.log("✅ Users seeded");

  const academicsCat = await prisma.category.findUnique({ where: { slug: "academics" } });
  const infraCat = await prisma.category.findUnique({ where: { slug: "infrastructure" } });
  const cafeCat = await prisma.category.findUnique({ where: { slug: "cafeteria" } });
  const hostelCat = await prisma.category.findUnique({ where: { slug: "hostel" } });

  // Sample posts
  const samplePosts = [
    {
      title: "Library closing too early during exam season",
      content: "The library closes at 8 PM but during exam weeks, students need access until at least midnight. This is affecting our study schedules significantly. Many of us have nowhere quiet to study in the evenings.",
      type: PostType.COMPLAINT,
      status: PostStatus.UNDER_REVIEW,
      categoryId: academicsCat!.id,
      authorId: students[0].id,
      tags: ["library", "exams", "study"],
      upvoteCount: 47,
    },
    {
      title: "Suggestion: Install more water purifiers in hostels",
      content: "The current water purifiers in Block A and Block B are frequently out of order. Students are forced to buy bottled water. Please install additional purifiers and set up a maintenance schedule.",
      type: PostType.SUGGESTION,
      status: PostStatus.IN_PROGRESS,
      categoryId: hostelCat!.id,
      authorId: students[1].id,
      tags: ["hostel", "water", "health"],
      upvoteCount: 83,
    },
    {
      title: "Cafeteria food quality has declined",
      content: "Over the past month, the quality of food in the main cafeteria has significantly dropped. The rice is often undercooked and the vegetables are not fresh. We pay a lot for the meal plan and deserve better.",
      type: PostType.COMPLAINT,
      status: PostStatus.PENDING,
      categoryId: cafeCat!.id,
      authorId: students[2].id,
      tags: ["food", "cafeteria", "quality"],
      upvoteCount: 112,
    },
    {
      title: "WiFi dead zones in Building C need urgent attention",
      content: "The entire second floor of Building C has no WiFi connectivity. This has been going on for 3 weeks. Online classes are being affected. Please fix this urgently.",
      type: PostType.URGENT,
      status: PostStatus.RESOLVED,
      categoryId: infraCat!.id,
      authorId: students[3].id,
      tags: ["wifi", "infrastructure", "urgent"],
      upvoteCount: 156,
      resolvedAt: new Date(),
    },
  ];

  for (const post of samplePosts) {
    await prisma.post.create({ data: post });
  }
  console.log("✅ Sample posts seeded");

  // Admin announcement
  await prisma.announcement.create({
    data: {
      title: "Welcome to Campus Echo!",
      content: "Campus Echo is your anonymous platform to share feedback, complaints, and suggestions with the administration. Your identity is always protected. We are committed to addressing every valid concern.",
      authorId: admin.id,
      isPinned: true,
    },
  });
  console.log("✅ Announcement seeded");

  console.log("🎉 Database seeding complete!");
  console.log("\nTest accounts:");
  console.log("Admin: admin@campusecho.app / Admin@123456");
  console.log("Moderator: mod@campusecho.app / Mod@123456");
  console.log("Student: student1@campusecho.app / Student@123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
