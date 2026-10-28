// Rules for checking a single answer. Shared by the chat (in the browser,
// for instant feedback) and the server (which never trusts the browser).

export const MAX_ANSWER_LENGTH = 1000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type QuestionRules = {
    type: "TEXT" | "EMAIL" | "MULTIPLE_CHOICE" | "YES_NO";
    required: boolean;
    options: string[];
};

// The buttons a question offers. Text and email questions have none.
export function choicesFor(question: QuestionRules): string[] {
    if (question.type === "YES_NO") return ["Yes", "No"];
    if (question.type === "MULTIPLE_CHOICE") return question.options;
    return [];
}

// Returns an error message, or null if the answer is fine.
// An empty string means "no answer" (skipped).
export function validateAnswer(
    question: QuestionRules,
    value: string,
): string | null {
    if (value === "") {
        return question.required ? "This question needs an answer." : null;
    }
    if (value.length > MAX_ANSWER_LENGTH) {
        return `Please keep it under ${MAX_ANSWER_LENGTH} characters.`;
    }
    if (question.type === "EMAIL" && !EMAIL_PATTERN.test(value)) {
        return "That doesn't look like an email address.";
    }
    const choices = choicesFor(question);
    if (choices.length > 0 && !choices.includes(value)) {
        return "Please pick one of the options.";
    }
    return null;
}