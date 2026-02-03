import { create } from 'zustand';

type CreatePostState = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

export const useCreatePostStore = create<CreatePostState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
