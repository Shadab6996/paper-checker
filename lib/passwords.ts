import { prisma } from "@/lib/db";

const READABLE_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no 0/O, 1/I/L

export function generatePassword(length = 6): string {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += READABLE_CHARS[Math.floor(Math.random() * READABLE_CHARS.length)];
  }
  return out;
}

function slugifyName(name: string): string {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "");
  return slug || "student";
}

export async function generateUniqueLoginId(name: string): Promise<string> {
  const base = slugifyName(name);
  let candidate = base;
  let suffix = 1;
  while (await prisma.student.findUnique({ where: { loginId: candidate } })) {
    suffix += 1;
    candidate = `${base}${suffix}`;
  }
  return candidate;
}

export function generateTestCode(subject: string, chapterName: string): string {
  const part = (s: string) =>
    s
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "")
      .slice(0, 4);
  const random = generatePassword(4);
  return [part(subject), part(chapterName), random].filter(Boolean).join("-");
}
