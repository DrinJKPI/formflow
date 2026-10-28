import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PublicForm } from "@/components/public-form";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Form" };

// The public page for a form: /f/<slug>. Anyone with the link can open it.
// Add ?embed=1 for the compact version used inside the website widget.
export default function PublicFormPage({
    params,
    searchParams,
}: PageProps<"/f/[slug]">) {
    return (
        <Suspense fallback={null}>
            <FormLoader params={params} searchParams={searchParams} />
        </Suspense>
    );
}

async function FormLoader({
    params,
    searchParams,
}: Pick<PageProps<"/f/[slug]">, "params" | "searchParams">) {
    const { slug } = await params;
    const embedded = (await searchParams).embed === "1";

    const form = await db.form.findUnique({
        where: { slug },
        select: {
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
    if (!form) notFound();

    if (form.status !== "PUBLISHED") {
        return (
            <Centered embedded={embedded}>
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
                    <h1 className="text-lg font-semibold">
                        This form isn&apos;t accepting responses
                    </h1>
                    <p className="mt-2 text-sm text-slate-500">
                        It may not be published yet, or it has been closed.
                    </p>
                </div>
            </Centered>
        );
    }

    const chat = <PublicForm slug={slug} form={form} embedded={embedded} />;

    // Inside the widget: just the chat, filling the whole frame.
    if (embedded) return <div className="h-dvh">{chat}</div>;

    return (
        <Centered embedded={false}>
            <div className="w-full max-w-md">
                <h1 className="text-center text-2xl font-bold tracking-tight">
                    {form.title}
                </h1>
                {form.description && (
                    <p className="mt-2 whitespace-pre-wrap text-center text-slate-600">
                        {form.description}
                    </p>
                )}
                <div className="mt-6">{chat}</div>
                <p className="mt-6 text-center text-xs text-slate-400">
                    Powered by{" "}
                    <Link href="/" className="font-medium hover:text-brand-600">
                        FormFlow
                    </Link>
                </p>
            </div>
        </Centered>
    );
}

function Centered({
    embedded,
    children,
}: {
    embedded: boolean;
    children: React.ReactNode;
}) {
    return (
        <main
            className={`flex flex-1 items-center justify-center bg-slate-50 px-4 ${embedded ? "h-dvh" : "py-12"
                }`}
        >
            {children}
        </main>
    );
}