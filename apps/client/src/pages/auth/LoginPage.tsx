import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { z } from 'zod';

import loginHero from '../../assets/hero/login-hero.png';
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
  remember: z.boolean().optional(),
});

type LoginValues = z.infer<typeof loginSchema>;

export const LoginPage = () => {
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      remember: false,
    },
  });

  const onSubmit = (values: LoginValues) => {
    console.log(values);
  };

  return (
    <section className="min-h-screen bg-zinc-950 px-6 py-12 text-zinc-100">
      <div className="mx-auto flex w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/60 shadow-2xl shadow-black/30 md:flex-row">
        <div className="relative flex w-full flex-col justify-end bg-zinc-950/80 p-10 md:w-1/2">
          <img
            src={loginHero}
            alt="ICHgram collage"
            className="absolute inset-0 h-full w-full object-cover opacity-60"
          />
          <div className="relative">
            <p className="text-sm uppercase tracking-[0.3em] text-zinc-400">
              Welcome back
            </p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight">
              Log in to your
              <span className="block text-zinc-300">creative circle</span>
            </h2>
            <p className="mt-4 text-sm text-zinc-400">
              Share moments, reply to stories, and keep your feed alive.
            </p>
          </div>
        </div>
        <div className="w-full p-10 md:w-1/2">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-semibold">Log in</h3>
            <Link
              className="text-sm text-zinc-400 hover:text-zinc-200"
              to="/signup"
            >
              Create account
            </Link>
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
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="you@ichgram.com"
                        type="email"
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
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="••••••••"
                        type="password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="remember"
                render={({ field }) => (
                  <FormItem>
                    <label className="flex items-center gap-2 text-sm text-zinc-400">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border border-zinc-700 bg-zinc-900 text-zinc-200"
                        checked={field.value}
                        onChange={field.onChange}
                      />
                      Remember me
                    </label>
                  </FormItem>
                )}
              />
              <div className="flex items-center justify-between text-sm text-zinc-400">
                <span />
                <Link className="hover:text-zinc-200" to="/reset">
                  Reset password
                </Link>
              </div>
              <Button type="submit" className="w-full">
                Log in
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </section>
  );
};
