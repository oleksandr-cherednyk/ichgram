import { create } from 'zustand';

type SearchState = {
  isOpen: boolean;
  query: string;
  setQuery: (query: string) => void;
  open: () => void;
  close: () => void;
  reset: () => void;
};

export const useSearchStore = create<SearchState>((set) => ({
  isOpen: false,
  query: '',
  setQuery: (query) => set({ query }),
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  reset: () => set({ isOpen: false, query: '' }),
}));
