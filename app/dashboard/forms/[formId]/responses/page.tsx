import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { LocalTime } from "@/components/local-time";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Responses" };

const MAX_SHOWN = 200;

export default function ResponsesPage({
    params,
}: PageProps<"/dashboard/forms/[formId]/responses">) {
    return (
        <Suspense fallback={<p className="text-slate-500">Loading responses…</p>}>
            <ResponsesList params={params} />
        </Suspense>
    );
}

async function ResponsesList({
    params,
}: Pick<PageProps<"/dashboard/forms/[formId]/responses">, "params">) {
    const { formId } = await params;
    const user = await requireUser();

    // Only the owner can see a form's responses.
    const form = await db.form.findFirst({
        where: { id: formId, userId: user.id },
        select: {
            id: true,
            title: true,
            slug: true,
            status: true,
            _count: { select: { responses: true } },
        },
    });
    if (!form) notFound();

    const responses = await db.response.findMany({
        where: { formId: form.id },
        orderBy: { createdAt: "desc" }, // newest first
        take: MAX_SHOWN,
        select: {
            id: true,
            createdAt: true,
            answers: {
                select: {
                    id: true,
                    questionLabel: true,
                    value: true,
                    question: { select: { position: true } }, // null if deleted
                },
            },
        },
    });

    const total = form._count.responses;

    return (
        <div>
            <Link
                href={`/dashboard/forms/${form.id}`}
                className="text-sm text-slate-500 hover:text-brand-600"
            >
                ← Back to editor
            </Link>
            <div className="mt-1 flex flex-wrap items-end justify-between gap-2">
                <h1 className="text-2xl font-bold tracking-tight">
                    Responses: {form.title}
                </h1>
                <p className="text-sm text-slate-500">
                    {total} response{total === 1 ? "" : "s"}
                    {total > MAX_SHOWN && ` (showing the newest ${MAX_SHOWN})`}
                </p>
            </div>

            {responses.length === 0 ? (
                <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
                    <p className="font-medium">No responses yet</p>
                    <p className="mt-1 text-sm text-slate-500">
                        {form.status === "PUBLISHED" ? (
                            <>
                                Share the public link{" "}
                                <Link
                                    href={`/f/${form.slug}`}
                                    className="font-mono text-brand-600 hover:underline"
                                >
                                    /f/{form.slug}
                                </Link>{" "}
                                to start collecting answers.
                            </>
                        ) : (
                            "Publish the form in the editor to start collecting answers."
                        )}
                    </p>
                </div>
            ) : (
                <ol className="mt-6 space-y-4">
                    {responses.map((response, index) => (
                        <li
                            key={response.id}
                            className="rounded-xl border border-slate-200 bg-white p-5"
                        >
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                                <h2 className="font-semibold">Response #{total - index}</h2>
                                <p className="text-sm text-slate-500">
                                    <LocalTime iso={response.createdAt.toISOString()} />
                                </p>
                            </div>
                            {response.answers.length === 0 ? (
                                <p className="mt-3 text-sm text-slate-500">
                                    All questions were skipped.
                                </p>
                            ) : (
                                <dl className="mt-3 space-y-3">
                                    {response.answers
                                        // Show answers in the form's question order; answers to
                                        // deleted questions go last
                                        .toSorted(
                                            (a, b) =>
                                                (a.question?.position ?? Infinity) -
                                                (b.question?.position ?? Infinity),
                                        )
                                        .map((answer) => (
                                            <div key={answer.id}>
                                                <dt className="text-sm text-slate-500">
                                                    {answer.questionLabel}
                                                    {!answer.question && " (question deleted)"}
                                                </dt>
                                                <dd className="mt-0.5 whitespace-pre-wrap break-words">
                                                    {answer.value}
                                                </dd>
                                            </div>
                                        ))}
                                </dl>
                            )}
                        </li>
                    ))}
                </ol>
            )}
        </div>
    );
}