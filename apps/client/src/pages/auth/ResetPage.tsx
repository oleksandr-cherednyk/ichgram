import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { z } from 'zod';

import logo from '../../assets/logo/logo.png';
import { Button } from '../../components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../components/ui/form';
import { Input } from '../../components/ui/input';
import { apiRequest } from '../../lib/api';
import { mapApiErrorsToForm } from '../../lib/form-errors';
import { type ApiError } from '../../types/api';

const resetSchema = z.object({
  email: z.string().email('Enter a valid email'),
});

type ResetValues = z.infer<typeof resetSchema>;

export const ResetPage = () => {
  const form = useForm<ResetValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      email: '',
    },
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const onSubmit = async (values: ResetValues) => {
    setFormError(null);
    setSuccessMessage(null);
    try {
      await apiRequest('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify(values),
      });
      setSuccessMessage('Reset link sent! Check your email.');
      form.reset();
    } catch (error) {
      const apiError = error as { error?: ApiError };
      const hasFieldErrors = mapApiErrorsToForm(
        apiError.error?.details,
        form.setError,
      );
      if (!hasFieldErrors) {
        setFormError(apiError.error?.message ?? 'Failed to send reset link');
      }
    }
  };

  return (
    <section className="flex min-h-screen pt-32 justify-center text-zinc-900">
      <div className="mx-auto flex p-2 flex-col gap-8 max-w-full h-max">
        <div className="w-full pt-2 max-w-md">
          <div className="border border-[#DBDBDB] bg-white px-10 pt-10 pb-4 flex flex-col">
            <div className="text-center">
              <img
                src={logo}
                alt="ICHGRAM"
                className="mx-auto h-34 w-auto object-contain"
              />
              <p className="mt-3 text-sm text-zinc-500">
                Enter your email and we&apos;ll send you a reset link.
              </p>
            </div>
            <Form {...form}>
              <form
                className="space-y-2 mt-6"
                onSubmit={form.handleSubmit(onSubmit)}
              >
                {formError ? (
                  <div className="rounded border border-[#DBDBDB] bg-[#fafafa] px-3 py-2 text-xs text-[#737373]">
                    {formError}
                  </div>
                ) : null}
                {successMessage ? (
                  <div className="rounded border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-700">
                    {successMessage}
                  </div>
                ) : null}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="sr-only">Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Email"
                          autoComplete="email"
                          type="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full mt-4"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting
                    ? 'Sending...'
                    : 'Send reset link'}
                </Button>
              </form>
            </Form>
          </div>
          <div className="mt-4 border border-[#DBDBDB] px-6 py-6 text-center text-sm">
            Remembered your password?{' '}
            <Link className="font-semibold text-[#0095F6]" to="/login">
              Go back
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
