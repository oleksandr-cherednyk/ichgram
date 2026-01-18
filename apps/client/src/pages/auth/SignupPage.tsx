import { Link } from 'react-router-dom';

import logo from '../../assets/logo/logo.png';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

export const SignupPage = () => (
  <section className="flex min-h-screen items-center justify-center bg-white px-6 py-12 text-zinc-900">
    <div className="w-full max-w-md">
      <div className="rounded-xl border border-zinc-200 bg-white px-8 py-10 shadow-sm">
        <div className="text-center">
          <img src={logo} alt="ICHGRAM" className="mx-auto h-8 w-auto" />
          <p className="mt-3 text-sm text-zinc-500">
            Sign up to see photos and videos from your friends.
          </p>
        </div>
        <form className="mt-8 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="signup-email">Email</Label>
            <Input
              id="signup-email"
              type="email"
              autoComplete="email"
              placeholder="Email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-fullname">Full name</Label>
            <Input
              id="signup-fullname"
              type="text"
              autoComplete="name"
              placeholder="Full name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-username">Username</Label>
            <Input
              id="signup-username"
              type="text"
              autoComplete="username"
              placeholder="Username"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-password">Password</Label>
            <Input
              id="signup-password"
              type="password"
              autoComplete="new-password"
              placeholder="Password"
            />
          </div>
          <Button type="submit" className="w-full">
            Sign up
          </Button>
        </form>
      </div>
      <div className="mt-4 rounded-xl border border-zinc-200 bg-white px-6 py-4 text-center text-sm text-zinc-600">
        Already have an account?{' '}
        <Link className="font-semibold text-zinc-900" to="/login">
          Log in
        </Link>
      </div>
    </div>
  </section>
);
