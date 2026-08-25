import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export type Role = "ADMIN" | "STUDENT";

export type SessionPayload = {
  role: Role;
  sub: string;
  name: string;
};

export const SESSION_COOKIE = "session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

function getSecretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verifySession(
  token: string | undefined
): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (
      typeof payload.role === "string" &&
      typeof payload.sub === "string" &&
      typeof payload.name === "string"
    ) {
      return { role: payload.role as Role, sub: payload.sub, name: payload.name };
    }
    return null;
  } catch {
    return null;
  }
}

export async function setSessionCookie(payload: SessionPayload) {
  const token = await signSession(payload);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  return verifySession(store.get(SESSION_COOKIE)?.value);
}

export async function requireRole(role: Role): Promise<SessionPayload | null> {
  const session = await getSession();
  if (!session || session.role !== role) return null;
  return session;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function parseAdminUsers(): Map<string, string> {
  const raw = process.env.ADMIN_USERS ?? "";
  const map = new Map<string, string>();
  for (const pair of raw.split(",")) {
    const [loginId, password] = pair.split(":").map((s) => s.trim());
    if (loginId && password) map.set(loginId, password);
  }
  return map;
}
