"use client";
// One form in the dashboard list, with Edit, Rename and Delete.

import Link from "next/link";
import { useState } from "react";
import { deleteForm, renameForm } from "@/app/actions/forms";
import { SubmitButton } from "@/components/submit-button";

type FormRowProps = {
    form: {
        id: string;
        title: string;
        status: "DRAFT" | "PUBLISHED";
        updated: string; // already formatted, e.g. "23 Oct 2026"
        questionCount: number;
        responseCount: number;
    };
};

export function FormRow({ form }: FormRowProps) {
    const [editing, setEditing] = useState(false);

    // Save the new title, then leave edit mode.
    const renameAction = async (formData: FormData) => {
        await renameForm(form.id, formData);
        setEditing(false);
    };
    // .bind(null, form.id) pre-fills the first argument (formId) of the action.
    const deleteAction = deleteForm.bind(null, form.id);

    return (
        <li className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
                {editing ? (
                    <form action={renameAction} className="flex gap-2">
                        <input
                            name="title"
                            defaultValue={form.title}
                            required
                            maxLength={100}
                            autoFocus
                            aria-label="Form title"
                            className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                        />
                        <SubmitButton
                            pendingText="Saving…"
                            className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-500"
                        >
                            Save
                        </SubmitButton>
                        <button
                            type="button"
                            onClick={() => setEditing(false)}
                            className="rounded-lg px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
                        >
                            Cancel
                        </button>
                    </form>
                ) : (
                    <>
                        <div className="flex items-center gap-2">
                            <h3 className="truncate font-medium">
                                <Link
                                    href={`/dashboard/forms/${form.id}`}
                                    className="hover:text-brand-600"
                                >
                                    {form.title}
                                </Link>
                            </h3>
                            <StatusBadge status={form.status} />
                        </div>
                        <p className="mt-1 text-sm text-slate-500">
                            {form.questionCount} question{form.questionCount === 1 ? "" : "s"}{" "}
                            · {form.responseCount} response
                            {form.responseCount === 1 ? "" : "s"} · Updated {form.updated}
                        </p>
                    </>
                )}
            </div>

            {!editing && (
                <div className="flex gap-2">
                    <Link
                        href={`/dashboard/forms/${form.id}`}
                        className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-500"
                    >
                        Edit
                    </Link>
                    <button
                        type="button"
                        onClick={() => setEditing(true)}
                        className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-50"
                    >
                        Rename
                    </button>
                    <form
                        action={deleteAction}
                        onSubmit={(event) => {
                            // Ask first; cancelling stops the form from submitting.
                            if (!confirm(`Delete "${form.title}" and all its responses?`)) {
                                event.preventDefault();
                            }
                        }}
                    >
                        <SubmitButton
                            pendingText="Deleting…"
                            className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
                        >
                            Delete
                        </SubmitButton>
                    </form>
                </div>
            )}
        </li>
    );
}

function StatusBadge({ status }: { status: "DRAFT" | "PUBLISHED" }) {
    return status === "PUBLISHED" ? (
        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
            Published
        </span>
    ) : (
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
            Draft
        </span>
    );
}