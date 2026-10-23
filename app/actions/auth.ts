"use server";
// Server Actions: these functions run only on the server, even though the
// forms in the browser call them directly.

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { db } from "@/lib/db";
import { createSession, deleteSession } from "@/lib/session";
import { loginSchema, signUpSchema, type AuthState } from "@/lib/validation";

// Cost factor for bcrypt: each +1 doubles the work. 12 takes ~250 ms, slow
// enough to make guessing passwords expensive, fast enough for users.
const BCRYPT_ROUNDS = 12;

// A real bcrypt hash of a throwaway string. If someone logs in with an email
// that doesn't exist, we still compare against this, so the response takes
// the same time and doesn't reveal which emails have accounts.
const DUMMY_HASH = bcrypt.hashSync("dummy-password", BCRYPT_ROUNDS);

export async function signup(
    _prevState: AuthState,
    formData: FormData,
): Promise<AuthState> {
    const parsed = signUpSchema.safeParse({
        email: formData.get("email"),
        password: formData.get("password"),
    });
    if (!parsed.success) {
        return {
            errors: z.flattenError(parsed.error).fieldErrors,
            email: String(formData.get("email") ?? ""),
        };
    }

    const { email, password } = parsed.data;
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    try {
        const user = await db.user.create({ data: { email, passwordHash } });
        await createSession(user.id);
    } catch (error) {
        // P2002 = unique constraint failed, i.e. the email is already registered
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002"
        ) {
            return { message: "An account with this email already exists.", email };
        }
        throw error;
    }

    // redirect() works by throwing, so it must be outside the try/catch.
    redirect("/dashboard");
}

export async function login(
    _prevState: AuthState,
    formData: FormData,
): Promise<AuthState> {
    const parsed = loginSchema.safeParse({
        email: formData.get("email"),
        password: formData.get("password"),
    });
    if (!parsed.success) {
        return {
            errors: z.flattenError(parsed.error).fieldErrors,
            email: String(formData.get("email") ?? ""),
        };
    }

    const { email, password } = parsed.data;
    const user = await db.user.findUnique({ where: { email } });
    const passwordOk = await bcrypt.compare(
        password,
        user?.passwordHash ?? DUMMY_HASH,
    );

    // Same message whether the email or the password was wrong.
    if (!user || !passwordOk) {
        return { message: "Incorrect email or password.", email };
    }

    await createSession(user.id);
    redirect("/dashboard");
}

export async function logout() {
    await deleteSession();
    redirect("/login");
}