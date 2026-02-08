import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';
import { Separator } from '../ui/separator';

type PostActionsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  isOwnPost: boolean;
  onDelete: () => void;
  onEdit: () => void;
};

export const PostActionsModal = ({
  isOpen,
  onClose,
  postId,
  isOwnPost,
  onDelete,
  onEdit,
}: PostActionsModalProps) => {
  const navigate = useNavigate();

  const handleGoToPost = () => {
    onClose();
    navigate(`/post/${postId}`);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/post/${postId}`,
      );
      toast.success('Link copied');
    } catch {
      toast.error('Failed to copy link');
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-w-[400px] rounded-xl p-0"
        hideCloseButton
        aria-describedby={undefined}
      >
        <DialogTitle className="sr-only">Post actions</DialogTitle>
        <div className="flex flex-col">
          {isOwnPost && (
            <>
              <button
                onClick={onDelete}
                className="w-full py-3.5 text-sm font-bold text-red-500 hover:bg-zinc-50"
              >
                Delete
              </button>
              <Separator />
              <button
                onClick={onEdit}
                className="w-full py-3.5 text-sm hover:bg-zinc-50"
              >
                Edit
              </button>
              <Separator />
            </>
          )}
          <button
            onClick={handleGoToPost}
            className="w-full py-3.5 text-sm hover:bg-zinc-50"
          >
            Go to post
          </button>
          <Separator />
          <button
            onClick={handleCopyLink}
            className="w-full py-3.5 text-sm hover:bg-zinc-50"
          >
            Copy link
          </button>
          <Separator />
          <button
            onClick={onClose}
            className="w-full py-3.5 text-sm hover:bg-zinc-50"
          >
            Cancel
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
