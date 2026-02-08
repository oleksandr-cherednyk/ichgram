import type { QueryClient } from '@tanstack/react-query';
import type { FeedPost, FeedResponse } from '../types/post';

type FeedCache = {
  pages: FeedResponse[];
  pageParams: (string | null)[];
};

export const updatePostInFeedCache = (
  queryClient: QueryClient,
  postId: string,
  updater: (post: FeedPost) => FeedPost,
) => {
  queryClient.setQueryData<FeedCache>(['posts', 'feed'], (old) => {
    if (!old) return old;
    return {
      ...old,
      pages: old.pages.map((page) => ({
        ...page,
        data: page.data.map((post) =>
          post.id === postId ? updater(post) : post,
        ),
      })),
    };
  });
};

export const updatePostCache = (
  queryClient: QueryClient,
  postId: string,
  updater: (post: FeedPost) => FeedPost,
) => {
  queryClient.setQueryData<{ post: FeedPost }>(['post', postId], (old) => {
    if (!old) return old;
    return { ...old, post: updater(old.post) };
  });
};
