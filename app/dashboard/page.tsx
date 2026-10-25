import type { Metadata } from "next";
import { Suspense } from "react";
import { createForm } from "@/app/actions/forms";
import { FormRow } from "@/components/form-row";
import { SubmitButton } from "@/components/submit-button";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
    return (
        <div>
            <div className="flex items-center justify-between gap-4">
                <h1 className="text-2xl font-bold tracking-tight">Your forms</h1>
                <form action={createForm}>
                    <SubmitButton
                        pendingText="Creating…"
                        className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-500"
                    >
                        + New form
                    </SubmitButton>
                </form>
            </div>

            {/* The list reads the session and the database, so it streams in. */}
            <Suspense fallback={<p className="mt-8 text-slate-500">Loading…</p>}>
                <FormsOverview />
            </Suspense>
        </div>
    );
}

async function FormsOverview() {
    const user = await requireUser();

    // One query: this user's forms, newest first, with question and
    // response counts worked out by the database.
    const forms = await db.form.findMany({
        where: { userId: user.id },
        orderBy: { updatedAt: "desc" },
        select: {
            id: true,
            title: true,
            status: true,
            updatedAt: true,
            _count: { select: { questions: true, responses: true } },
        },
    });

    const totalResponses = forms.reduce(
        (sum, form) => sum + form._count.responses,
        0,
    );

    return (
        <>
            <dl className="mt-6 grid grid-cols-2 gap-4">
                <Stat label="Total forms" value={forms.length} />
                <Stat label="Total responses" value={totalResponses} />
            </dl>

            {forms.length === 0 ? (
                <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
                    <p className="font-medium">No forms yet</p>
                    <p className="mt-1 text-sm text-slate-500">
                        Click &ldquo;+ New form&rdquo; to create your first one.
                    </p>
                </div>
            ) : (
                <ul className="mt-6 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
                    {forms.map((form) => (
                        <FormRow
                            key={form.id}
                            form={{
                                id: form.id,
                                title: form.title,
                                status: form.status,
                                // Format the date on the server so the browser shows the
                                // exact same text (avoids a hydration mismatch).
                                updated: form.updatedAt.toLocaleDateString("en-GB", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                }),
                                questionCount: form._count.questions,
                                responseCount: form._count.responses,
                            }}
                        />
                    ))}
                </ul>
            )}
        </>
    );
}

function Stat({ label, value }: { label: string; value: number }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
            <dt className="text-sm text-slate-500">{label}</dt>
            <dd className="mt-1 text-3xl font-bold tracking-tight">{value}</dd>
        </div>
    );
}