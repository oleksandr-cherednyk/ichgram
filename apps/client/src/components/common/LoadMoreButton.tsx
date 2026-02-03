import { Spinner } from '../ui/spinner';

type LoadMoreButtonProps = {
  onLoadMore: () => void;
  isLoading: boolean;
};

export const LoadMoreButton = ({
  onLoadMore,
  isLoading,
}: LoadMoreButtonProps) => (
  <div className="flex justify-center py-8">
    <button
      onClick={onLoadMore}
      disabled={isLoading}
      className="text-sm text-[#0095F6] hover:text-[#1aa1ff] disabled:opacity-50"
    >
      {isLoading ? <Spinner size="sm" /> : 'Load more'}
    </button>
  </div>
);
