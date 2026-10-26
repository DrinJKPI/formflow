import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { FormEditor } from "@/components/form-editor";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Edit form" };

// The [formId] folder name makes this a dynamic route:
// /dashboard/forms/abc123 → params.formId === "abc123"
export default function EditFormPage({
    params,
}: PageProps<"/dashboard/forms/[formId]">) {
    return (
        <Suspense fallback={<p className="text-slate-500">Loading form…</p>}>
            <EditorLoader params={params} />
        </Suspense>
    );
}

async function EditorLoader({
    params,
}: {
    params: PageProps<"/dashboard/forms/[formId]">["params"];
}) {
    const { formId } = await params;
    const user = await requireUser();

    // Only find the form if it belongs to the logged-in user.
    const form = await db.form.findFirst({
        where: { id: formId, userId: user.id },
        select: {
            id: true,
            title: true,
            description: true,
            status: true,
            welcomeMessage: true,
            completionMessage: true,
            primaryColor: true,
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
    if (!form) notFound(); // shows a 404 page

    return (
        <FormEditor
            formId={form.id}
            status={form.status}
            initialData={{
                title: form.title,
                description: form.description ?? "",
                welcomeMessage: form.welcomeMessage,
                completionMessage: form.completionMessage,
                primaryColor: form.primaryColor,
                questions: form.questions,
            }}
        />
    );
}