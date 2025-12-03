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
  memberId: z.string().describe('ID anggota arisan.'),
  paymentHistory: z
    .string()
    .describe(
      'String JSON yang berisi riwayat pembayaran anggota, termasuk tanggal jatuh tempo, jumlah yang dibayar, dan pembayaran yang terlambat.'
    ),
  communicationPreferences: z
    .string()
    .describe(
      'String JSON yang berisi preferensi komunikasi anggota, termasuk saluran pilihan (email, SMS, dll.) dan waktu yang disukai dalam sehari.'
    ),
  currentCycleDueDate: z
    .string()
    .describe('Tanggal jatuh tempo untuk siklus pembayaran saat ini dalam format ISO (YYYY-MM-DD).'),
});
export type PaymentReminderOptimizationInput = z.infer<
  typeof PaymentReminderOptimizationInputSchema
>;

// Define the output schema for the flow
const PaymentReminderOptimizationOutputSchema = z.object({
  reminderSchedule: z
    .string()
    .describe(
      'String JSON yang berisi jadwal pengingat yang dioptimalkan, termasuk tanggal/waktu dan saluran untuk mengirim pengingat.'
    ),
  reasoning: z
    .string()
    .describe(
      'Alasan AI di balik jadwal pengingat yang dioptimalkan, menjelaskan mengapa jadwal yang dipilih diharapkan dapat meningkatkan tingkat pembayaran tepat waktu.'
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
  prompt: `Anda adalah asisten AI yang dirancang untuk mengoptimalkan jadwal pengingat pembayaran untuk anggota arisan.
  Semua keluaran harus dalam Bahasa Indonesia.

  Berdasarkan informasi anggota berikut:
  - ID Anggota: {{{memberId}}}
  - Riwayat Pembayaran: {{{paymentHistory}}}
  - Preferensi Komunikasi: {{{communicationPreferences}}}
  - Tanggal Jatuh Tempo Siklus Saat Ini: {{{currentCycleDueDate}}}

  Tentukan waktu dan frekuensi optimal untuk mengirim pengingat pembayaran kepada anggota ini untuk meningkatkan tingkat pembayaran tepat waktu.

  Pertimbangkan riwayat pembayaran anggota, preferensi komunikasi, dan tanggal jatuh tempo. Berikan jadwal pengingat dalam format JSON dan jelaskan alasan Anda untuk jadwal yang dipilih.

  Contoh jadwal pengingat:
  {
    "reminders": [
      {
        "date": "YYYY-MM-DD",
        "time": "HH:MM",
        "channel": "email",
        "message": "Pengingat ramah bahwa pembayaran arisan Anda akan segera jatuh tempo.",
      },
      {
        "date": "YYYY-MM-DD",
        "time": "HH:MM",
        "channel": "SMS",
        "message": "Tanggal jatuh tempo pembayaran arisan mendekat!",
      },
    ],
  }
  Kembalikan reminderSchedule dan reasoning dalam format JSON berikut:
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
