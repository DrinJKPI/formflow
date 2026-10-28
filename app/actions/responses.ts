"use server";
// Saving a visitor's answers. This is public: no login needed, so every
// answer is checked against the form's real questions before saving.

import { z } from "zod";
import { validateAnswer } from "@/lib/answer-rules";
import { db } from "@/lib/db";

const answersSchema = z
    .array(z.object({ questionId: z.string(), value: z.string() }))
    .max(50);

export async function submitResponse(
    slug: string,
    input: unknown,
): Promise<{ ok: true } | { ok: false; error: string }> {
    const parsed = answersSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: "Invalid answers." };

    const form = await db.form.findUnique({
        where: { slug },
        select: {
            id: true,
            status: true,
            questions: {
                orderBy: { position: "asc" },
                select: {
                    id: true,
                    type: true,
                    label: true,
                    required: true,
                    options: true,
                },
            },
        },
    });
    if (!form || form.status !== "PUBLISHED") {
        return { ok: false, error: "This form isn't accepting responses." };
    }

    // One answer per question, matched by ID. Answers to questions that
    // aren't in this form are ignored.
    const given = new Map(parsed.data.map((a) => [a.questionId, a.value.trim()]));

    const answers = [];
    for (const question of form.questions) {
        const value = given.get(question.id) ?? "";
        const problem = validateAnswer(question, value);
        if (problem) return { ok: false, error: `${question.label}: ${problem}` };
        if (value !== "") {
            answers.push({
                questionId: question.id,
                questionLabel: question.label, // a copy, in case the form changes later
                value,
            });
        }
    }

    // Creates the response and all its answers together.
    await db.response.create({
        data: { formId: form.id, answers: { create: answers } },
    });

    return { ok: true };
}