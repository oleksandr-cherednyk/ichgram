import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { z } from 'zod';

import loginHero from '../../assets/hero/login-hero.png';
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

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
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

  const onSubmit = (values: LoginValues) => {
    console.log(values);
  };

  return (
    <section className="flex min-h-screen items-center justify-center bg-white px-6 py-12 text-zinc-900">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 md:flex-row md:items-center">
        <div className="hidden w-full items-center justify-center md:flex md:w-1/2">
          <div className="flex h-[560px] w-[360px] items-center justify-center">
            <img
              src={loginHero}
              alt="Phone mockup"
              className="h-full w-full object-contain"
            />
          </div>
        </div>
        <div className="w-full md:w-1/2">
          <div className="rounded-xl border border-zinc-200 bg-white px-8 py-10 shadow-sm">
            <div className="text-center">
              <img src={logo} alt="ICHGRAM" className="mx-auto h-24 w-auto" />
            </div>
            <Form {...form}>
              <form
                className="mt-8 space-y-4"
                onSubmit={form.handleSubmit(onSubmit)}
              >
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
                  className="w-full"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? 'Logging in...' : 'Log in'}
                </Button>
              </form>
            </Form>
            <div className="my-6 flex items-center gap-4 text-xs uppercase text-zinc-400">
              <span className="h-px flex-1 bg-zinc-200" />
              <span>or</span>
              <span className="h-px flex-1 bg-zinc-200" />
            </div>
            <div className="text-center">
              <Link
                className="text-sm text-zinc-600 hover:text-zinc-900"
                to="/reset"
              >
                Forgot password?
              </Link>
            </div>
          </div>
          <div className="mt-4 rounded-xl border border-zinc-200 bg-white px-6 py-4 text-center text-sm text-zinc-600">
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
