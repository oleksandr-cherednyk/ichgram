import { Link } from 'react-router-dom';

import logo from '../../assets/logo/logo.png';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

export const SignupPage = () => (
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
          <form className="space-y-2 mt-6">
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
            <Button type="submit" className="w-full mt-4">
              Sign up
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
