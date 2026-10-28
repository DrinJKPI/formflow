"use server";
// Server Actions for managing forms from the dashboard.
// Every action checks who is logged in and only touches that user's forms.

import { randomBytes } from "node:crypto";
import { refresh } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { formEditorSchema, formTitleSchema } from "@/lib/validation";

export async function createForm() {
  const user = await requireUser();

  await db.form.create({
    data: {
      userId: user.id,
      title: "Untitled form",
      // Short random ID for the public link, e.g. /f/k3J9x_Qa
      slug: randomBytes(6).toString("base64url"),
    },
  });

  refresh(); // re-render the dashboard so the new form appears
}

export async function renameForm(formId: string, formData: FormData) {
  const user = await requireUser();
  const parsed = formTitleSchema.safeParse(formData.get("title"));
  if (!parsed.success) return; // the input's own rules make this rare

  // `userId` in the filter means you can only rename your own forms,
  // even if someone sends a different form's ID.
  await db.form.updateMany({
    where: { id: formId, userId: user.id },
    data: { title: parsed.data },
  });

  refresh();
}

export async function deleteForm(formId: string) {
  const user = await requireUser();

  // Deleting a form also deletes its questions and responses
  // (onDelete: Cascade in the schema).
  await db.form.deleteMany({
    where: { id: formId, userId: user.id },
  });

  refresh();
}

// Publish or unpublish a form. Only published forms accept responses.
export async function setPublished(
  formId: string,
  publish: boolean,
): Promise<{ error?: string }> {
  const user = await requireUser();

  const form = await db.form.findFirst({
    where: { id: formId, userId: user.id },
    select: { _count: { select: { questions: true } } },
  });
  if (!form) return { error: "Form not found." };
  if (publish && form._count.questions === 0) {
    return { error: "Add at least one question before publishing." };
  }

  await db.form.update({
    where: { id: formId },
    data: { status: publish ? "PUBLISHED" : "DRAFT" },
  });

  refresh();
  return {};
}

// What saveForm sends back to the editor.
export type SaveFormResult =
  | {
    ok: true;
    // The saved questions, now with real database IDs.
    questions: {
      id: string;
      type: "TEXT" | "EMAIL" | "MULTIPLE_CHOICE" | "YES_NO";
      label: string;
      required: boolean;
      options: string[];
    }[];
  }
  | { ok: false; error: string };

// Saves everything from the form editor in one go: the settings and the
// full, ordered list of questions.
export async function saveForm(
  formId: string,
  input: unknown, // checked below; never trust data from the browser
): Promise<SaveFormResult> {
  const user = await requireUser();

  const parsed = formEditorSchema.safeParse(input);
  if (!parsed.success) {
    // Turn the first problem into a readable message,
    // e.g. "Question 2: every question needs some text."
    const issue = parsed.error.issues[0];
    const [field, index] = issue.path;
    const prefix =
      field === "questions" && typeof index === "number"
        ? `Question ${index + 1}: `
        : "";
    return { ok: false, error: prefix + issue.message };
  }
  const data = parsed.data;

  // Make sure the form exists and belongs to this user.
  const form = await db.form.findFirst({
    where: { id: formId, userId: user.id },
    select: { questions: { select: { id: true } } },
  });
  if (!form) return { ok: false, error: "Form not found." };

  const existingIds = new Set(form.questions.map((q) => q.id));
  const keptIds = data.questions
    .map((q) => q.id)
    .filter((id) => existingIds.has(id));

  // All-or-nothing: if any step fails, none of the changes are saved.
  await db.$transaction([
    db.form.update({
      where: { id: formId },
      data: {
        title: data.title,
        description: data.description || null,
        welcomeMessage: data.welcomeMessage,
        completionMessage: data.completionMessage,
        primaryColor: data.primaryColor,
      },
    }),
    // Questions removed in the editor
    db.question.deleteMany({ where: { formId, id: { notIn: keptIds } } }),
    // Update existing questions and create new ones, in their new order
    ...data.questions.map((q, position) => {
      const fields = {
        type: q.type,
        label: q.label,
        required: q.required,
        options: q.type === "MULTIPLE_CHOICE" ? q.options : [],
        position,
      };
      return existingIds.has(q.id)
        ? db.question.update({ where: { id: q.id }, data: fields })
        : db.question.create({ data: { ...fields, formId } });
    }),
  ]);

  const questions = await db.question.findMany({
    where: { formId },
    orderBy: { position: "asc" },
    select: {
      id: true,
      type: true,
      label: true,
      required: true,
      options: true,
    },
  });
  return { ok: true, questions };
}