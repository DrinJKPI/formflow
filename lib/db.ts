// Shared Prisma client for the whole app.
import "server-only"; // build error if this file is ever imported into browser code
import { PrismaClient } from "@prisma/client";

// In development, Next.js reloads modules on every save. Without this, each
// reload would create a new PrismaClient and open new database connections
// until Supabase refuses more. We keep one instance on `globalThis` instead.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db =
    globalForPrisma.prisma ??
    new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    });

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = db;
}