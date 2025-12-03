'use server';

import {
  optimizePaymentReminders,
  type PaymentReminderOptimizationInput,
} from '@/ai/flows/payment-reminder-optimization';

export async function getOptimizedReminders(
  input: PaymentReminderOptimizationInput
) {
  try {
    const result = await optimizePaymentReminders(input);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error optimizing reminders:', error);
    // In a production app, you'd want to log this error to a monitoring service.
    return {
      success: false,
      error: 'Failed to generate reminder schedule. Please try again later.',
    };
  }
}
