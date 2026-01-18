import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';

import logo from '../../assets/logo/logo.png';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { apiRequest } from '../../lib/api';
import { type ApiError } from '../../types/api';
import { type AuthResponse } from '../../types/auth';
import { useAuthStore } from '../../stores/auth';

const signupSchema = z.object({
  email: z.string().email('Enter a valid email'),
  fullName: z.string().min(2, 'Enter your full name'),
  username: z.string().min(3, 'Username is too short'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type SignupValues = z.infer<typeof signupSchema>;

export const SignupPage = () => {
  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      fullName: '',
      username: '',
      password: '',
    },
  });
  const [formError, setFormError] = useState<string | null>(null);
  const navigate = useNavigate();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  const onSubmit = async (values: SignupValues) => {
    setFormError(null);
    try {
      const response = await apiRequest<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(values),
      });
      setAccessToken(response.accessToken);
      navigate('/me');
    } catch (error) {
      const apiError = error as { error?: ApiError };
      setFormError(apiError.error?.message ?? 'Sign up failed');
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
                Sign up to see photos and videos from your friends.
              </p>
            </div>
            <form
              className="space-y-2 mt-6"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              {formError ? (
                <div className="rounded border border-[#DBDBDB] bg-[#fafafa] px-3 py-2 text-xs text-[#737373]">
                  {formError}
                </div>
              ) : null}
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  autoComplete="email"
                  placeholder="Email"
                  {...form.register('email')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-fullname">Full name</Label>
                <Input
                  id="signup-fullname"
                  type="text"
                  autoComplete="name"
                  placeholder="Full name"
                  {...form.register('fullName')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-username">Username</Label>
                <Input
                  id="signup-username"
                  type="text"
                  autoComplete="username"
                  placeholder="Username"
                  {...form.register('username')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Password"
                  {...form.register('password')}
                />
              </div>
              <Button
                type="submit"
                className="w-full mt-4"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? 'Signing up...' : 'Sign up'}
              </Button>
            </form>
          </div>
          <div className="mt-4 border border-[#DBDBDB] px-6 py-6 text-center text-sm">
            Already have an account?{' '}
            <Link className="font-semibold text-[#0095F6]" to="/login">
              Log in
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
