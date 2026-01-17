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
    <section className="flex min-h-screen items-center justify-center">
      <div className="mx-auto flex w-full max-w-5xl flex-col overflow-hidden  md:flex-row">
        <div className="flex w-full flex-col justify-between gap-8p-10 md:w-1/2">
          <img
            src={loginHero}
            alt="ICHgram collage"
            className="h-56 w-full object-contain"
          />
        </div>
        <div className="w-full p-10 md:w-1/2">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-semibold">Log in</h3>
            <Link
              className="text-sm text-zinc-500 hover:text-zinc-900"
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
                    <label className="flex items-center gap-2 text-sm text-zinc-500">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border border-zinc-300 bg-white text-zinc-900"
                        checked={field.value}
                        onChange={field.onChange}
                      />
                      Remember me
                    </label>
                  </FormItem>
                )}
              />
              <div className="flex items-center justify-between text-sm text-zinc-500">
                <span />
                <Link className="hover:text-zinc-900" to="/reset">
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
