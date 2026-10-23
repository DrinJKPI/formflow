// Input validation rules and the shape of the auth forms' state.
import { z } from "zod";

const email = z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email("Enter a valid email address."));

export const signUpSchema = z.object({
    email,
    password: z
        .string()
        .min(8, "Password must be at least 8 characters.")
        // bcrypt only uses the first 72 bytes of a password
        .max(72, "Password must be at most 72 characters."),
});

export const loginSchema = z.object({
    email,
    password: z.string().min(1, "Enter your password."),
});

// What a sign-up or login action sends back to the form when it fails.
export type AuthState =
    | {
        errors?: { email?: string[]; password?: string[] }; // per-field messages
        message?: string; // a general message shown above the button
        email?: string; // so the email field stays filled in
    }
    | undefined;

export const formTitleSchema = z
    .string()
    .trim()
    .min(1, "Title can't be empty.")
    .max(100, "Title must be at most 100 characters.");