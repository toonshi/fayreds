// OWNER: Hendy. Admin login for Faith (single password from ADMIN_PASSWORD).
import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, SESSION_DAYS, signToken, verifyToken } from "./session";

export { ADMIN_COOKIE, verifyToken };

export function checkPassword(input: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const a = createHash("sha256").update(input).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

export async function createSession() {
  (await cookies()).set(ADMIN_COOKIE, await signToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * SESSION_DAYS,
  });
}

export async function deleteSession() {
  (await cookies()).delete(ADMIN_COOKIE);
}

export async function isAdmin() {
  return verifyToken((await cookies()).get(ADMIN_COOKIE)?.value);
}

/** Call at the top of every admin page, server action and route handler. */
export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}
