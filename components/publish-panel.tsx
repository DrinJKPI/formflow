"use client";
// Publish / unpublish a form, and share its public link once it's live.

import { useState, useSyncExternalStore, useTransition } from "react";
import { setPublished } from "@/app/actions/forms";

type PublishPanelProps = {
    formId: string;
    slug: string;
    status: "DRAFT" | "PUBLISHED";
    hasUnsavedChanges: boolean;
};

// The site's address, e.g. "http://localhost:3000" or the deployed URL.
// Empty during server rendering, filled in once the page runs in the browser.
function useOrigin() {
    return useSyncExternalStore(
        () => () => { },
        () => window.location.origin,
        () => "",
    );
}

export function PublishPanel({
    formId,
    slug,
    status,
    hasUnsavedChanges,
}: PublishPanelProps) {
    const [pending, startTransition] = useTransition();
    const [error, setError] = useState<string>();
    const [copied, setCopied] = useState(false);
    const origin = useOrigin();

    const published = status === "PUBLISHED";
    const publicUrl = `${origin}/f/${slug}`;

    function toggle() {
        setError(undefined);
        startTransition(async () => {
            const result = await setPublished(formId, !published);
            if (result.error) setError(result.error);
        });
    }

    async function copyLink() {
        await navigator.clipboard.writeText(publicUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <section className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <h2 className="font-semibold">Publishing</h2>
                    {published ? (
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                            Published
                        </span>
                    ) : (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                            Draft
                        </span>
                    )}
                </div>
                <button
                    type="button"
                    onClick={toggle}
                    disabled={pending || (!published && hasUnsavedChanges)}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${published
                            ? "border border-slate-300 hover:bg-slate-50"
                            : "bg-emerald-600 text-white hover:bg-emerald-500"
                        }`}
                >
                    {pending ? "Please wait…" : published ? "Unpublish" : "Publish"}
                </button>
            </div>

            <p className="mt-2 text-sm text-slate-500">
                {published
                    ? "Anyone with the link can fill in this form."
                    : hasUnsavedChanges
                        ? "Save your changes before publishing."
                        : "Publish the form to get a public link."}
            </p>

            {error && (
                <p role="alert" className="mt-2 text-sm text-red-600">
                    {error}
                </p>
            )}

            {published && (
                <div className="mt-3 flex flex-wrap gap-2">
                    <input
                        readOnly
                        value={publicUrl}
                        aria-label="Public link"
                        onFocus={(e) => e.target.select()}
                        className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 font-mono text-xs"
                    />
                    <button
                        type="button"
                        onClick={copyLink}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50"
                    >
                        {copied ? "Copied!" : "Copy link"}
                    </button>
                    <a
                        href={`/f/${slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50"
                    >
                        Open
                    </a>
                </div>
            )}
        </section>
    );
}