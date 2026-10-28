"use client";
// The chat on the public form page, connected to the database: when the
// visitor finishes, their answers are sent to the submitResponse action.

import { submitResponse } from "@/app/actions/responses";
import { ChatForm, type ChatFormData } from "@/components/chat-form";

type PublicFormProps = {
    slug: string;
    form: ChatFormData;
    embedded: boolean;
};

export function PublicForm({ slug, form, embedded }: PublicFormProps) {
    async function handleSubmit(
        answers: { questionId: string; value: string }[],
    ) {
        const result = await submitResponse(slug, answers);
        // Throwing makes the chat show its "couldn't be sent / Try again" state.
        if (!result.ok) throw new Error(result.error);
    }

    return (
        <ChatForm
            form={form}
            onSubmit={handleSubmit}
            variant={embedded ? "fill" : "card"}
        />
    );
}