type LoadingScreenProps = {
  message?: string;
};

export const LoadingScreen = ({
  message = 'Loading...',
}: LoadingScreenProps) => (
  <div className="flex min-h-screen items-center justify-center">
    <p className="text-zinc-500">{message}</p>
  </div>
);
