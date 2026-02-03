import { PostDetailModal } from '../feed/PostDetailModal';

type PostViewModalProps = {
  postId: string | null;
  onClose: () => void;
};

export const PostViewModal = ({ postId, onClose }: PostViewModalProps) => {
  return <PostDetailModal postId={postId} onClose={onClose} />;
};
