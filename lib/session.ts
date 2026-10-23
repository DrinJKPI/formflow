// Session management: creating, reading and deleting login sessions.
import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

const SESSION_COOKIE = "formflow_session";
const SESSION_DAYS = 30;

// The cookie stores a random token. The database stores only a SHA-256 hash
// of it, so someone who reads the database still can't log in as anyone.
function hashToken(token: string) {
    return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string) {
    const token = randomBytes(32).toString("base64url"); // 256 random bits
    const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

    await db.session.create({
        data: { id: hashToken(token), userId, expiresAt },
    });

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, token, {
        httpOnly: true, // JavaScript in the browser can't read it
        secure: process.env.NODE_ENV === "production", // HTTPS only when deployed
        sameSite: "lax", // not sent on cross-site form posts (CSRF protection)
        path: "/",
        expires: expiresAt,
    });
}

// Returns the logged-in user, or null. Wrapped in React's `cache` so that
// several components asking in the same request only hit the database once.
export const getCurrentUser = cache(async () => {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    if (!token) return null;

    const session = await db.session.findUnique({
        where: { id: hashToken(token) },
        include: { user: { select: { id: true, email: true } } },
    });

    if (!session || session.expiresAt < new Date()) return null;
    return session.user;
});

// For pages that need a logged-in user: returns the user or redirects.
export async function requireUser() {
    const user = await getCurrentUser();
    if (!user) redirect("/login");
    return user;
}

export async function deleteSession() {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    if (token) {
        await db.session.deleteMany({ where: { id: hashToken(token) } });
    }
    cookieStore.delete(SESSION_COOKIE);
}