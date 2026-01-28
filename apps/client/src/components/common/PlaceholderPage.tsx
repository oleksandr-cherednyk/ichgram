type PlaceholderPageProps = {
  title: string;
};

export const PlaceholderPage = ({ title }: PlaceholderPageProps) => (
  <div className="flex min-h-screen items-center justify-center">
    <p className="text-zinc-500">{title} - Coming soon</p>
  </div>
);
