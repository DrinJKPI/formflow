"use client";
// The form builder: edit settings and questions on the left, see a live
// chat preview on the right, then save everything with one button

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { saveForm } from "@/app/actions/forms";
import { ChatForm } from "@/components/chat-form";
import { PublishPanel } from "@/components/publish-panel";
import { QuestionEditor } from "@/components/question-editor";
import type { FormEditorData } from "@/lib/validation";

export type EditorQuestion = FormEditorData["questions"][number];
export type QuestionType = EditorQuestion["type"];

type FormEditorProps = {
    formId: string;
    slug: string;
    status: "DRAFT" | "PUBLISHED";
    initialData: FormEditorData;
};

const addButtons: { type: QuestionType; label: string }[] = [
    { type: "TEXT", label: "Text" },
    { type: "EMAIL", label: "Email" },
    { type: "MULTIPLE_CHOICE", label: "Multiple choice" },
    { type: "YES_NO", label: "Yes / No" },
];

export function FormEditor({
    formId,
    slug,
    status,
    initialData,
}: FormEditorProps) {
    const [data, setData] = useState(initialData); // what you're editing
    const [saved, setSaved] = useState(initialData); // what's in the database
    const [message, setMessage] = useState<{ ok: boolean; text: string }>();
    const [saving, startSaving] = useTransition();

    // Unsaved changes = the current data differs from the last saved data.
    const dirty = JSON.stringify(data) !== JSON.stringify(saved);

    // Warn before closing the tab or reloading with unsaved changes
    useEffect(() => {
        if (!dirty) return;
        const warn = (event: BeforeUnloadEvent) => event.preventDefault();
        window.addEventListener("beforeunload", warn);
        return () => window.removeEventListener("beforeunload", warn);
    }, [dirty]);

    // ----- Changing the data -----

    function setField<K extends keyof FormEditorData>(
        key: K,
        value: FormEditorData[K],
    ) {
        setData((current) => ({ ...current, [key]: value }));
        setMessage(undefined);
    }

    function setQuestions(
        update: (questions: EditorQuestion[]) => EditorQuestion[],
    ) {
        setData((current) => ({
            ...current,
            questions: update(current.questions),
        }));
        setMessage(undefined);
    }

    function addQuestion(type: QuestionType) {
        setQuestions((questions) => [
            ...questions,
            {
                id: `new-${crypto.randomUUID()}`, // temporary ID until it's saved
                type,
                label: "",
                required: true,
                options: type === "MULTIPLE_CHOICE" ? ["Option 1", "Option 2"] : [],
            },
        ]);
    }

    function updateQuestion(index: number, changes: Partial<EditorQuestion>) {
        setQuestions((questions) =>
            questions.map((q, i) => (i === index ? { ...q, ...changes } : q)),
        );
    }

    // direction -1 = up, +1 = down: swap with the neighbouring question
    function moveQuestion(index: number, direction: -1 | 1) {
        setQuestions((questions) => {
            const target = index + direction;
            if (target < 0 || target >= questions.length) return questions;
            const copy = [...questions];
            [copy[index], copy[target]] = [copy[target], copy[index]];
            return copy;
        });
    }

    function removeQuestion(index: number) {
        setQuestions((questions) => questions.filter((_, i) => i !== index));
    }

    // ----- Saving -----

    function save() {
        startSaving(async () => {
            const result = await saveForm(formId, data);
            if (result.ok) {
                // Swap the temporary IDs for the real ones from the database
                const savedData = { ...data, questions: result.questions };
                setData(savedData);
                setSaved(savedData);
                setMessage({ ok: true, text: "All changes saved." });
            } else {
                setMessage({ ok: false, text: result.error });
            }
        });
    }

    return (
        <div>
            {/* Top bar */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <Link
                        href="/dashboard"
                        className="text-sm text-slate-500 hover:text-brand-600"
                    >
                        ← All forms
                    </Link>
                    <h1 className="mt-1 text-2xl font-bold tracking-tight">
                        {data.title || "Untitled form"}
                    </h1>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <Link
                        href={`/dashboard/forms/${formId}/responses`}
                        className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50"
                    >
                        Responses
                    </Link>
                    {dirty && !saving && (
                        <span className="text-sm text-slate-500">Unsaved changes</span>
                    )}
                    <button
                        type="button"
                        onClick={save}
                        disabled={!dirty || saving}
                        className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {saving ? "Saving…" : "Save changes"}
                    </button>
                </div>
            </div>

            {message && (
                <p
                    role={message.ok ? "status" : "alert"}
                    className={`mt-4 rounded-lg px-3 py-2 text-sm ${message.ok
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-red-50 text-red-700"
                        }`}
                >
                    {message.text}
                </p>
            )}

            <div className="mt-6 grid items-start gap-8 lg:grid-cols-[1fr_24rem]">
                {/* Left: the editor */}
                <div className="space-y-6">
                    <PublishPanel
                        formId={formId}
                        slug={slug}
                        status={status}
                        color={data.primaryColor}
                        hasUnsavedChanges={dirty}
                    />

                    <section className="rounded-xl border border-slate-200 bg-white p-5">
                        <h2 className="font-semibold">Form settings</h2>
                        <div className="mt-4 space-y-4">
                            <TextField
                                label="Title"
                                value={data.title}
                                maxLength={100}
                                onChange={(value) => setField("title", value)}
                            />
                            <TextField
                                label="Description (optional, shown on the public page)"
                                value={data.description}
                                maxLength={500}
                                multiline
                                onChange={(value) => setField("description", value)}
                            />
                            <TextField
                                label="Welcome message"
                                value={data.welcomeMessage}
                                maxLength={300}
                                multiline
                                onChange={(value) => setField("welcomeMessage", value)}
                            />
                            <TextField
                                label="Completion message"
                                value={data.completionMessage}
                                maxLength={300}
                                multiline
                                onChange={(value) => setField("completionMessage", value)}
                            />
                            <div>
                                <label
                                    htmlFor="primaryColor"
                                    className="block text-sm font-medium"
                                >
                                    Widget colour
                                </label>
                                <div className="mt-1 flex items-center gap-3">
                                    <input
                                        id="primaryColor"
                                        type="color"
                                        value={data.primaryColor}
                                        onChange={(e) => setField("primaryColor", e.target.value)}
                                        className="h-10 w-14 cursor-pointer rounded border border-slate-300"
                                    />
                                    <span className="font-mono text-sm text-slate-600">
                                        {data.primaryColor}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="rounded-xl border border-slate-200 bg-white p-5">
                        <h2 className="font-semibold">Questions</h2>

                        {data.questions.length === 0 ? (
                            <p className="mt-3 text-sm text-slate-500">
                                No questions yet. Add your first one below.
                            </p>
                        ) : (
                            <ol className="mt-4 space-y-4">
                                {data.questions.map((question, index) => (
                                    <QuestionEditor
                                        key={question.id}
                                        question={question}
                                        number={index + 1}
                                        isFirst={index === 0}
                                        isLast={index === data.questions.length - 1}
                                        onChange={(changes) => updateQuestion(index, changes)}
                                        onMove={(direction) => moveQuestion(index, direction)}
                                        onRemove={() => removeQuestion(index)}
                                    />
                                ))}
                            </ol>
                        )}

                        <div className="mt-5 border-t border-slate-200 pt-4">
                            <p className="text-sm font-medium">Add a question</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {addButtons.map((button) => (
                                    <button
                                        key={button.type}
                                        type="button"
                                        onClick={() => addQuestion(button.type)}
                                        className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium hover:border-brand-500 hover:text-brand-600"
                                    >
                                        + {button.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right: live preview (below the editor on small screens) */}
                <aside className="lg:sticky lg:top-6">
                    <h2 className="font-semibold">Preview</h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Restarts whenever you make a change. Nothing is saved.
                    </p>
                    <div className="mt-3">
                        {/* A new `key` creates a fresh chat whenever the data changes. */}
                        <ChatForm
                            key={JSON.stringify(data)}
                            form={{
                                ...data,
                                title: data.title || "Untitled form",
                                questions: data.questions.map((q) => ({
                                    ...q,
                                    label: q.label || "(question text)",
                                    // skip blank and repeated options while you're typing
                                    options: [...new Set(q.options.filter(Boolean))],
                                })),
                            }}
                        />
                    </div>
                </aside>
            </div>
        </div>
    );
}

// A labelled text input or textarea
function TextField({
    label,
    value,
    onChange,
    maxLength,
    multiline = false,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    maxLength: number;
    multiline?: boolean;
}) {
    const className =
        "mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500";
    return (
        <label className="block text-sm font-medium">
            {label}
            {multiline ? (
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    maxLength={maxLength}
                    rows={2}
                    className={className}
                />
            ) : (
                <input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    maxLength={maxLength}
                    className={className}
                />
            )}
        </label>
    );
}