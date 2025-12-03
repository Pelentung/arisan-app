'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type Member } from '@/app/data';
import { getOptimizedReminders } from '@/app/actions';
import {
  type PaymentReminderOptimizationOutput,
} from '@/ai/flows/payment-reminder-optimization';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';

const FormSchema = z.object({
  dueDate: z.date({
    required_error: 'A due date is required.',
  }),
});

interface Reminder {
  date: string;
  time: string;
  channel: string;
  message: string;
}

export function ReminderOptimizer({ member }: { member: Member }) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] =
    useState<PaymentReminderOptimizationOutput | null>(null);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsLoading(true);
    setResult(null);

    const input = {
      memberId: member.id,
      paymentHistory: JSON.stringify(member.paymentHistory),
      communicationPreferences: JSON.stringify(member.communicationPreferences),
      currentCycleDueDate: format(data.dueDate, 'yyyy-MM-dd'),
    };

    const response = await getOptimizedReminders(input);

    if (response.success && response.data) {
      setResult(response.data);
    } else {
      toast({
        title: 'Error',
        description: response.error,
        variant: 'destructive',
      });
    }

    setIsLoading(false);
  }

  const parsedSchedule = result?.reminderSchedule ? JSON.parse(result.reminderSchedule) : null;

  return (
    <div className="py-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Current Cycle Due Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={'outline'}
                        className={cn(
                          'pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value ? (
                          format(field.value, 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  Select the due date for the upcoming payment.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Generating...' : 'Generate Schedule'}
          </Button>
        </form>
      </Form>

      {result && (
        <div className="mt-8 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>AI Generated Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                    {parsedSchedule && parsedSchedule.reminders.length > 0 ? (
                        <ScrollArea className="h-48">
                            <ul className="space-y-4 pr-4">
                            {(parsedSchedule.reminders as Reminder[]).map((reminder, index) => (
                                <li key={index} className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-16 text-right">
                                    <p className="font-semibold text-sm">{format(new Date(reminder.date), 'MMM d')}</p>
                                    <p className="text-xs text-muted-foreground">{reminder.time}</p>
                                </div>
                                <div className="relative w-full">
                                    <span className="absolute left-0 top-1.5 h-full w-px bg-border -translate-x-3.5"></span>
                                    <span className="absolute left-0 top-2 h-2 w-2 rounded-full bg-primary -translate-x-4"></span>
                                    <p className="font-medium capitalize text-sm">{reminder.channel} Reminder</p>
                                    <p className="text-sm text-muted-foreground">{reminder.message}</p>
                                </div>
                                </li>
                            ))}
                            </ul>
                        </ScrollArea>
                    ) : (
                        <p className="text-muted-foreground">No reminders suggested.</p>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Reasoning</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">{result.reasoning}</p>
                </CardContent>
            </Card>
        </div>
      )}
    </div>
  );
}
