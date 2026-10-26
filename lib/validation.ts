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


// ---------- Form builder ----------

export const questionTypes = [
  "TEXT",
  "EMAIL",
  "MULTIPLE_CHOICE",
  "YES_NO",
] as const;

const questionSchema = z
  .object({
    id: z.string().min(1), // a real ID, or "new-…" for unsaved questions
    type: z.enum(questionTypes),
    label: z
      .string()
      .trim()
      .min(1, "every question needs some text.")
      .max(300, "question text must be at most 300 characters."),
    required: z.boolean(),
    options: z
      .array(
        z
          .string()
          .trim()
          .min(1, "options can't be empty.")
          .max(100, "options must be at most 100 characters."),
      )
      .max(10, "a question can have at most 10 options."),
  })
  .refine((q) => q.type !== "MULTIPLE_CHOICE" || q.options.length >= 2, {
    message: "multiple choice needs at least 2 options.",
    path: ["options"],
  })
  .refine((q) => new Set(q.options).size === q.options.length, {
    message: "options must all be different.",
    path: ["options"],
  });

export const formEditorSchema = z.object({
  title: formTitleSchema,
  description: z
    .string()
    .trim()
    .max(500, "Description must be at most 500 characters."),
  welcomeMessage: z
    .string()
    .trim()
    .min(1, "Welcome message can't be empty.")
    .max(300, "Welcome message must be at most 300 characters."),
  completionMessage: z
    .string()
    .trim()
    .min(1, "Completion message can't be empty.")
    .max(300, "Completion message must be at most 300 characters."),
  primaryColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Colour must be a hex code like #dc2626."),
  questions: z
    .array(questionSchema)
    .max(50, "A form can have at most 50 questions."),
});

export type FormEditorData = z.infer<typeof formEditorSchema>;