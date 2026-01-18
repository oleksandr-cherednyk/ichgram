import { Link } from 'react-router-dom';

import logo from '../../assets/logo/logo.png';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

export const ResetPage = () => (
  <section className="flex min-h-screen items-center justify-center bg-white px-6 py-12 text-zinc-900">
    <div className="w-full max-w-md">
      <div className="rounded-xl border border-zinc-200 bg-white px-8 py-10 shadow-sm">
        <div className="text-center">
          <img src={logo} alt="ICHGRAM" className="mx-auto h-8 w-auto" />
          <p className="mt-3 text-sm text-zinc-500">
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>
        <form className="mt-8 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reset-email">Email</Label>
            <Input
              id="reset-email"
              type="email"
              autoComplete="email"
              placeholder="Email"
            />
          </div>
          <Button type="submit" className="w-full">
            Send reset link
          </Button>
        </form>
      </div>
      <div className="mt-4 rounded-xl border border-zinc-200 bg-white px-6 py-4 text-center text-sm text-zinc-600">
        Remembered your password?{' '}
        <Link className="font-semibold text-zinc-900" to="/login">
          Go back
        </Link>
      </div>
    </div>
  </section>
);
