import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

import heroImage from '../../assets/hero/login-hero-2.png';

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className="flex min-h-screen items-center justify-center text-zinc-900">
          <div className="mx-auto flex max-w-4xl flex-col gap-12 p-6 md:flex-row md:items-center">
            <div className="hidden md:block md:w-1/2">
              <img
                src={heroImage}
                alt="Illustration"
                className="h-full w-full object-contain"
              />
            </div>

            <div className="md:w-1/2">
              <h1 className="text-2xl font-bold">Oops! Something Went Wrong</h1>
              <p className="mt-4 leading-relaxed text-zinc-600">
                An unexpected error occurred. Please try refreshing the page or
                go back to the home page.
              </p>
              <a
                href="/"
                className="mt-6 inline-flex h-11 items-center justify-center rounded-[8px] bg-[#0095F6] px-4 text-sm font-semibold text-white transition hover:bg-[#1aa1ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500/50"
              >
                Go to home
              </a>
            </div>
          </div>
        </section>
      );
    }

    return this.props.children;
  }
}
