import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const demoStudents = [
  { name: "Demo Student One", loginId: "demo1", password: "Demo1234" },
  { name: "Demo Student Two", loginId: "demo2", password: "Demo1234" },
];

async function main() {
  for (const s of demoStudents) {
    const passwordHash = await bcrypt.hash(s.password, 10);
    await prisma.student.upsert({
      where: { loginId: s.loginId },
      update: {},
      create: { name: s.name, loginId: s.loginId, passwordHash },
    });
  }

  console.log("Seeded demo students (local testing only):");
  for (const s of demoStudents) {
    console.log(`  loginId=${s.loginId}  password=${s.password}`);
  }
  console.log("Admin login comes from ADMIN_USERS in your .env.local");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
