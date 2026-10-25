"use client";
// The chatbot: shows a form's questions one at a time as a chat.
// It's used for the landing page demo now, and later for the form builder
// preview, the public form page and the embeddable widget.

import { useEffect, useRef, useState } from "react";

export type ChatQuestion = {
    id: string;
    type: "TEXT" | "EMAIL" | "MULTIPLE_CHOICE" | "YES_NO";
    label: string;
    required: boolean;
    options: string[]; // only used by MULTIPLE_CHOICE
};

export type ChatFormData = {
    title: string;
    welcomeMessage: string;
    completionMessage: string;
    primaryColor: string; // e.g. "#dc2626"
    questions: ChatQuestion[];
};

export type ChatAnswer = { questionId: string; value: string };

type ChatFormProps = {
    form: ChatFormData;
    // Called once with all answers after the last question. Leave it out
    // (e.g. for demos and previews) and nothing is saved.
    onSubmit?: (answers: ChatAnswer[]) => Promise<void>;
};

type Message = { id: number; from: "bot" | "user"; text: string };
type Status = "answering" | "submitting" | "done" | "error";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_ANSWER_LENGTH = 1000;

// Returns an error message, or null if the answer is fine.
function validate(question: ChatQuestion, value: string): string | null {
    if (value === "") {
        return question.required ? "This question needs an answer." : null;
    }
    if (value.length > MAX_ANSWER_LENGTH) {
        return `Please keep it under ${MAX_ANSWER_LENGTH} characters.`;
    }
    if (question.type === "EMAIL" && !EMAIL_PATTERN.test(value)) {
        return "That doesn't look like an email address.";
    }
    return null;
}

// Yes/no questions always offer the same two buttons.
function choicesFor(question: ChatQuestion): string[] {
    if (question.type === "YES_NO") return ["Yes", "No"];
    if (question.type === "MULTIPLE_CHOICE") return question.options;
    return [];
}

export function ChatForm({ form, onSubmit }: ChatFormProps) {
    const { questions } = form;

    // The opening messages: the welcome text, then the first question
    // (or straight to the thank-you message if the form has no questions).
    const startMessages = (): Message[] => [
        { id: 0, from: "bot", text: form.welcomeMessage },
        {
            id: 1,
            from: "bot",
            text: questions[0]?.label ?? form.completionMessage,
        },
    ];

    const [messages, setMessages] = useState<Message[]>(startMessages);
    const [step, setStep] = useState(0); // index of the current question
    const [answers, setAnswers] = useState<ChatAnswer[]>([]);
    const [input, setInput] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState<Status>(
        questions.length === 0 ? "done" : "answering",
    );

    // Keep the newest message in view (scrolls the chat, not the page).
    const logRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
    }, [messages, status]);

    // After each answer, put the cursor back in the text box. Not on the
    // first question, so the page doesn't jump to the chat when it loads.
    const inputRef = useRef<HTMLInputElement>(null);
    useEffect(() => {
        if (step > 0) inputRef.current?.focus({ preventScroll: true });
    }, [step]);

    const question = questions[step];
    const choices = question ? choicesFor(question) : [];

    // Add a message to the end of the chat.
    const say = (from: Message["from"], text: string) =>
        setMessages((current) => [...current, { id: current.length, from, text }]);

    async function finish(allAnswers: ChatAnswer[]) {
        setStatus("submitting");
        try {
            await onSubmit?.(allAnswers);
            setStatus("done");
            say("bot", form.completionMessage);
        } catch {
            setStatus("error");
        }
    }

    // Handles an answer (or a skip) for the current question.
    function answer(rawValue: string) {
        if (!question || status !== "answering") return;
        const value = rawValue.trim();

        const problem = validate(question, value);
        if (problem) {
            setError(problem);
            return;
        }

        setError(null);
        setInput("");
        say("user", value === "" ? "Skipped" : value);

        const nextAnswers =
            value === "" ? answers : [...answers, { questionId: question.id, value }];
        setAnswers(nextAnswers);

        const nextStep = step + 1;
        setStep(nextStep);
        if (nextStep < questions.length) {
            say("bot", questions[nextStep].label);
        } else {
            finish(nextAnswers);
        }
    }

    function restart() {
        setMessages(startMessages());
        setStep(0);
        setAnswers([]);
        setInput("");
        setError(null);
        setStatus(questions.length === 0 ? "done" : "answering");
    }

    return (
        <div
            // The form's colour is set once here as a CSS variable, then used by
            // the Tailwind classes below, e.g. bg-[var(--chat-color)].
            style={{ "--chat-color": form.primaryColor } as React.CSSProperties}
            className="flex h-[32rem] max-h-full w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white text-left text-sm text-slate-900 shadow-xl"
        >
            <div className="bg-[var(--chat-color)] px-4 py-3 font-semibold text-white">
                {form.title}
            </div>

            <div
                ref={logRef}
                role="log"
                aria-live="polite"
                className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4"
            >
                {messages.map((message) => (
                    <p
                        key={message.id}
                        className={
                            message.from === "bot"
                                ? "mr-10 w-fit whitespace-pre-wrap break-words rounded-2xl rounded-tl-sm bg-white px-3 py-2 shadow-sm"
                                : "ml-auto w-fit whitespace-pre-wrap break-words rounded-2xl rounded-tr-sm bg-[var(--chat-color)] px-3 py-2 text-white"
                        }
                    >
                        {message.text}
                    </p>
                ))}

                {status === "answering" && question && !question.required && (
                    <p className="text-xs text-slate-500">This question is optional.</p>
                )}
                {status === "submitting" && (
                    <p className="text-xs text-slate-500">Sending your answers…</p>
                )}
            </div>

            <div className="border-t border-slate-200 p-3">
                {status === "answering" && question && (
                    <>
                        {error && (
                            <p role="alert" className="mb-2 text-xs text-red-600">
                                {error}
                            </p>
                        )}

                        {choices.length > 0 ? (
                            // Multiple choice and yes/no: one button per option.
                            <div className="flex flex-wrap gap-2">
                                {choices.map((choice) => (
                                    <button
                                        key={choice}
                                        type="button"
                                        onClick={() => answer(choice)}
                                        className="rounded-full border border-[var(--chat-color)] px-3 py-1.5 font-medium text-[var(--chat-color)] hover:bg-[var(--chat-color)] hover:text-white"
                                    >
                                        {choice}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            // Text and email: a typed answer.
                            <form
                                onSubmit={(event) => {
                                    event.preventDefault(); // stay on the page
                                    answer(input);
                                }}
                                noValidate // we show our own error messages instead
                                className="flex gap-2"
                            >
                                <input
                                    ref={inputRef}
                                    value={input}
                                    onChange={(event) => setInput(event.target.value)}
                                    type={question.type === "EMAIL" ? "email" : "text"}
                                    inputMode={question.type === "EMAIL" ? "email" : "text"}
                                    placeholder={
                                        question.type === "EMAIL"
                                            ? "name@example.com"
                                            : "Type your answer…"
                                    }
                                    aria-label={question.label}
                                    aria-invalid={Boolean(error)}
                                    maxLength={MAX_ANSWER_LENGTH}
                                    className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-[var(--chat-color)]"
                                />
                                <button
                                    type="submit"
                                    className="rounded-lg bg-[var(--chat-color)] px-3 py-2 font-semibold text-white hover:opacity-90"
                                >
                                    Send
                                </button>
                            </form>
                        )}

                        {!question.required && (
                            <button
                                type="button"
                                onClick={() => answer("")}
                                className="mt-2 text-xs font-medium text-slate-500 hover:text-slate-800"
                            >
                                Skip this question
                            </button>
                        )}
                    </>
                )}

                {status === "error" && (
                    <div className="flex items-center justify-between gap-2">
                        <p role="alert" className="text-xs text-red-600">
                            Your answers couldn&apos;t be sent.
                        </p>
                        <button
                            type="button"
                            onClick={() => finish(answers)}
                            className="rounded-lg bg-[var(--chat-color)] px-3 py-1.5 font-semibold text-white"
                        >
                            Try again
                        </button>
                    </div>
                )}

                {status === "done" && (
                    <button
                        type="button"
                        onClick={restart}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 font-medium hover:bg-slate-50"
                    >
                        Start again
                    </button>
                )}

                {status === "submitting" && (
                    <p className="text-center text-xs text-slate-500">Please wait…</p>
                )}
            </div>
        </div>
    );
}