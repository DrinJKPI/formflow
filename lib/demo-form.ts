// Sample form for the live demo on the landing page.
import type { ChatFormData } from "@/components/chat-form";

export const demoForm: ChatFormData = {
    title: "Customer feedback",
    welcomeMessage: "Hi there! Got a minute to answer a few quick questions?",
    completionMessage:
        "Thanks for trying FormFlow! In a real form, your answers would now be saved.",
    primaryColor: "#dc2626",
    questions: [
        {
            id: "name",
            type: "TEXT",
            label: "First, what's your name?",
            required: true,
            options: [],
        },
        {
            id: "source",
            type: "MULTIPLE_CHOICE",
            label: "How did you hear about us?",
            required: true,
            options: ["Search engine", "A friend", "Social media", "Other"],
        },
        {
            id: "recommend",
            type: "YES_NO",
            label: "Would you recommend us to a friend?",
            required: true,
            options: [],
        },
        {
            id: "email",
            type: "EMAIL",
            label: "What's your email, in case we have a follow-up question?",
            required: false,
            options: [],
        },
    ],
};