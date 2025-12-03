'use server';

/**
 * @fileOverview AI-powered payment reminder optimization flow.
 *
 * This file defines a Genkit flow that uses AI to determine the optimal timing and frequency
 * for sending payment reminders to arisan members, based on their payment history and
 * communication preferences, to improve on-time payment rates.
 *
 * @exported optimizePaymentReminders - The main function to trigger the payment reminder optimization flow.
 * @exported PaymentReminderOptimizationInput - The input type for the optimizePaymentReminders function.
 * @exported PaymentReminderOptimizationOutput - The output type for the optimizePaymentReminders function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema for the flow
const PaymentReminderOptimizationInputSchema = z.object({
  memberId: z.string().describe('The ID of the arisan member.'),
  paymentHistory: z
    .string()
    .describe(
      'A JSON string containing the payment history of the member, including due dates, amounts paid, and late payments.'
    ),
  communicationPreferences: z
    .string()
    .describe(
      'A JSON string containing the member communication preferences, including preferred channels (email, SMS, etc.) and preferred times of day.'
    ),
  currentCycleDueDate: z
    .string()
    .describe('Due date for the current payment cycle in ISO format (YYYY-MM-DD).'),
});
export type PaymentReminderOptimizationInput = z.infer<
  typeof PaymentReminderOptimizationInputSchema
>;

// Define the output schema for the flow
const PaymentReminderOptimizationOutputSchema = z.object({
  reminderSchedule: z
    .string()
    .describe(
      'A JSON string containing the optimized reminder schedule, including dates/times and channels for sending reminders.'
    ),
  reasoning: z
    .string()
    .describe(
      'The AI reasoning behind the optimized reminder schedule, explaining why the chosen schedule is expected to improve on-time payment rates.'
    ),
});
export type PaymentReminderOptimizationOutput = z.infer<
  typeof PaymentReminderOptimizationOutputSchema
>;

// Exported function to trigger the payment reminder optimization flow
export async function optimizePaymentReminders(
  input: PaymentReminderOptimizationInput
): Promise<PaymentReminderOptimizationOutput> {
  return paymentReminderOptimizationFlow(input);
}

// Define the prompt
const paymentReminderOptimizationPrompt = ai.definePrompt({
  name: 'paymentReminderOptimizationPrompt',
  input: {schema: PaymentReminderOptimizationInputSchema},
  output: {schema: PaymentReminderOptimizationOutputSchema},
  prompt: `You are an AI assistant designed to optimize payment reminder schedules for arisan members.

  Given the following information about a member:
  - Member ID: {{{memberId}}}
  - Payment History: {{{paymentHistory}}}
  - Communication Preferences: {{{communicationPreferences}}}
  - Current Cycle Due Date: {{{currentCycleDueDate}}}

  Determine the optimal timing and frequency for sending payment reminders to this member to improve on-time payment rates.

  Consider the member's payment history, communication preferences, and the due date. Provide a reminder schedule in JSON format and explain your reasoning for the chosen schedule.

  Example reminder schedule:
  {
    "reminders": [
      {
        "date": "YYYY-MM-DD",
        "time": "HH:MM",
        "channel": "email",
        "message": "Friendly reminder that your arisan payment is due soon.",
      },
      {
        "date": "YYYY-MM-DD",
        "time": "HH:MM",
        "channel": "SMS",
        "message": "Arisan payment due date approaching!",
      },
    ],
  }
  Return both reminderSchedule and reasoning in the following JSON format:
  {
    "reminderSchedule": "string",
    "reasoning": "string"
  }
  `,
});

// Define the flow
const paymentReminderOptimizationFlow = ai.defineFlow(
  {
    name: 'paymentReminderOptimizationFlow',
    inputSchema: PaymentReminderOptimizationInputSchema,
    outputSchema: PaymentReminderOptimizationOutputSchema,
  },
  async input => {
    const {output} = await paymentReminderOptimizationPrompt(input);
    return output!;
  }
);
