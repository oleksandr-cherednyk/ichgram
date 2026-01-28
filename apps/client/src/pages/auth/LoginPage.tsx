import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';

import loginHero from '../../assets/hero/login-hero-2.png';
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
import { type AuthResponse } from '../../types/auth';
import { type ApiError } from '../../types/api';
import { useAuthStore } from '../../stores/auth';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginValues = z.infer<typeof loginSchema>;

export const LoginPage = () => {
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  const [formError, setFormError] = useState<string | null>(null);
  const navigate = useNavigate();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  const onSubmit = async (values: LoginValues) => {
    setFormError(null);
    try {
      const response = await apiRequest<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(values),
      });
      setAccessToken(response.accessToken);
      navigate('/me');
    } catch (error) {
      const apiError = error as { error?: ApiError };
      const hasFieldErrors = mapApiErrorsToForm(
        apiError.error?.details,
        form.setError,
      );
      if (!hasFieldErrors) {
        setFormError(apiError.error?.message ?? 'Login failed');
      }
    }
  };

  return (
    <section className="flex min-h-screen pt-32 justify-center  text-zinc-900">
      <div className="mx-auto flex  p-2 flex-col gap-8 md:flex-row max-w-full h-max">
        <div className="hidden md:block w-full md:w-7/13">
          <img
            src={loginHero}
            alt="Phone mockup"
            className="h-full  object-contain"
          />
        </div>

        <div className="w-full md:w-6/13 pt-2 max-w-md">
          <div className="border border-[#DBDBDB] bg-white px-10 pt-10 pb-4 flex flex-col">
            <div className="text-center">
              <img
                src={logo}
                alt="ICHGRAM"
                className="mx-auto h-34 w-auto object-contain"
              />
            </div>
            <Form {...form}>
              <form
                className="space-y-2"
                onSubmit={form.handleSubmit(onSubmit)}
              >
                {formError ? (
                  <div className="rounded border border-[#DBDBDB] bg-[#fafafa] px-3 py-2 text-xs text-[#737373]">
                    {formError}
                  </div>
                ) : null}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="sr-only">
                        Username or email
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Username or email"
                          autoComplete="username"
                          type="text"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="sr-only">Password</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Password"
                          autoComplete="current-password"
                          type="password"
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
                  {form.formState.isSubmitting ? 'Logging in...' : 'Log in'}
                </Button>
              </form>
            </Form>
            <div className="my-7 flex items-center gap-4 text-xs uppercase text-zinc-400">
              <span className="h-px flex-1 bg-zinc-200" />
              <span>or</span>
              <span className="h-px flex-1 bg-zinc-200" />
            </div>
            <div className="text-center mt-10">
              <Link
                className="text-sm text-[#00376B] hover:text-zinc-900"
                to="/reset"
              >
                Forgot password?
              </Link>
            </div>
          </div>
          <div className="mt-4 border border-[#DBDBDB] px-6 py-6 text-center text-sm ">
            Don&apos;t have an account?{' '}
            <Link className="font-semibold text-[#0095F6]" to="/signup">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
