"use client";
// One question in the form builder: type, text, options, required,
// and buttons to move or delete it.

import type { EditorQuestion, QuestionType } from "@/components/form-editor";

const typeLabels: Record<QuestionType, string> = {
    TEXT: "Text",
    EMAIL: "Email",
    MULTIPLE_CHOICE: "Multiple choice",
    YES_NO: "Yes / No",
};

type QuestionEditorProps = {
    question: EditorQuestion;
    number: number;
    isFirst: boolean;
    isLast: boolean;
    onChange: (changes: Partial<EditorQuestion>) => void;
    onMove: (direction: -1 | 1) => void;
    onRemove: () => void;
};

export function QuestionEditor({
    question,
    number,
    isFirst,
    isLast,
    onChange,
    onMove,
    onRemove,
}: QuestionEditorProps) {
    const { options } = question;

    function changeType(type: QuestionType) {
        // Switching to multiple choice? Start with two options to edit.
        const needsOptions = type === "MULTIPLE_CHOICE" && options.length < 2;
        onChange({
            type,
            options: needsOptions ? ["Option 1", "Option 2"] : options,
        });
    }

    function setOption(index: number, value: string) {
        onChange({ options: options.map((o, i) => (i === index ? value : o)) });
    }

    return (
        <li className="rounded-lg border border-slate-200 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-semibold text-slate-500">
                    Question {number}
                </span>
                <div className="flex gap-1">
                    <IconButton
                        label="Move up"
                        disabled={isFirst}
                        onClick={() => onMove(-1)}
                    >
                        ↑
                    </IconButton>
                    <IconButton
                        label="Move down"
                        disabled={isLast}
                        onClick={() => onMove(1)}
                    >
                        ↓
                    </IconButton>
                    <IconButton label="Delete question" onClick={onRemove} danger>
                        ✕
                    </IconButton>
                </div>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_11rem]">
                <input
                    value={question.label}
                    onChange={(e) => onChange({ label: e.target.value })}
                    placeholder="Type your question…"
                    maxLength={300}
                    aria-label={`Question ${number} text`}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                />
                <select
                    value={question.type}
                    onChange={(e) => changeType(e.target.value as QuestionType)}
                    aria-label={`Question ${number} type`}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                >
                    {Object.entries(typeLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                            {label}
                        </option>
                    ))}
                </select>
            </div>

            {question.type === "MULTIPLE_CHOICE" && (
                <div className="mt-3 space-y-2">
                    {options.map((option, index) => (
                        <div key={index} className="flex gap-2">
                            <input
                                value={option}
                                onChange={(e) => setOption(index, e.target.value)}
                                maxLength={100}
                                aria-label={`Option ${index + 1}`}
                                className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                            />
                            <IconButton
                                label={`Remove option ${index + 1}`}
                                disabled={options.length <= 2}
                                onClick={() =>
                                    onChange({ options: options.filter((_, i) => i !== index) })
                                }
                            >
                                ✕
                            </IconButton>
                        </div>
                    ))}
                    {options.length < 10 && (
                        <button
                            type="button"
                            onClick={() =>
                                onChange({
                                    options: [...options, `Option ${options.length + 1}`],
                                })
                            }
                            className="text-sm font-medium text-brand-600 hover:underline"
                        >
                            + Add option
                        </button>
                    )}
                </div>
            )}

            {question.type === "YES_NO" && (
                <p className="mt-3 text-sm text-slate-500">
                    Visitors answer with Yes or No buttons.
                </p>
            )}

            <label className="mt-3 flex w-fit items-center gap-2 text-sm">
                <input
                    type="checkbox"
                    checked={question.required}
                    onChange={(e) => onChange({ required: e.target.checked })}
                    className="h-4 w-4 accent-brand-600"
                />
                Required
            </label>
        </li>
    );
}

function IconButton({
    label,
    onClick,
    disabled = false,
    danger = false,
    children,
}: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    danger?: boolean;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            aria-label={label}
            title={label}
            className={`h-8 w-8 rounded-lg border text-sm disabled:cursor-not-allowed disabled:opacity-30 ${danger
                    ? "border-red-200 text-red-600 hover:bg-red-50"
                    : "border-slate-300 hover:bg-slate-50"
                }`}
        >
            {children}
        </button>
    );
}