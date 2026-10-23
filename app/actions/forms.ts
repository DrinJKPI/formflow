"use server";
// Server Actions for managing forms from the dashboard.
// Every action checks who is logged in and only touches that user's forms.

import { randomBytes } from "node:crypto";
import { refresh } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { formTitleSchema } from "@/lib/validation";

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