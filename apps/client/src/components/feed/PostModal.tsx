import type { FeedPost } from '../../types/post';
import { PostDetailModal } from './PostDetailModal';

type PostModalProps = {
  post: FeedPost | null;
  onClose: () => void;
};

export const PostModal = ({ post, onClose }: PostModalProps) => {
  return <PostDetailModal post={post} onClose={onClose} />;
};
