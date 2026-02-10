import heroImage from '../assets/hero/login-hero-2.png';

export const NotFoundPage = () => (
  <section className="flex min-h-[calc(100vh-158px)] items-center justify-center text-zinc-900">
    <div className="mx-auto flex max-w-6xl flex-col gap-12 p-6 md:flex-row md:items-start">
      <div className="hidden md:block md:w-1/3">
        <img
          src={heroImage}
          alt="Illustration"
          className="h-full w-full object-contain"
        />
      </div>

      <div className="md:w-2/3 pt-12">
        <h1 className="text-[36px] font-bold">
          Oops! Page Not Found (404 Error)
        </h1>
        <p className="mt-4 font-[600] leading-relaxed text-[#737373]">
          We&apos;re sorry, but the page you&apos;re looking for doesn&apos;t
          seem to exist.
          <br />
          If you typed the URL manually, please double-check the spelling.
          <br />
          If you clicked on a link, it may be outdated or broken.
        </p>
      </div>
    </div>
  </section>
);
