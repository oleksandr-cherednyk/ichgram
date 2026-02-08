import { Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { useSearchTags, useSearchUsers } from '../../hooks';
import { useNotificationStore } from '../../stores/notification';
import { useSearchStore } from '../../stores/search';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { SearchResults } from './SearchResults';

export const SearchOverlay = () => {
  const { isOpen, query, setQuery, reset } = useSearchStore();
  const closeNotifications = useNotificationStore((s) => s.close);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close notification overlay when search opens
  useEffect(() => {
    if (isOpen) {
      closeNotifications();
    }
  }, [isOpen, closeNotifications]);

  // Debounce the search query (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Focus input when overlay opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        overlayRef.current &&
        !overlayRef.current.contains(event.target as Node)
      ) {
        reset();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, reset]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        reset();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, reset]);

  // Search queries
  const { data: usersData, isLoading: usersLoading } =
    useSearchUsers(debouncedQuery);
  const { data: tagsData, isLoading: tagsLoading } =
    useSearchTags(debouncedQuery);

  const isLoading = usersLoading || tagsLoading;
  const users = usersData?.data ?? [];
  const tags = tagsData?.data ?? [];

  const handleClose = () => {
    reset();
  };

  return (
    <div
      ref={overlayRef}
      className={`absolute left-0 md:left-[72px] top-0 z-30 flex h-full w-full md:w-[400px] flex-col md:rounded-r-2xl border-r border-[#DBDBDB] bg-white transition-transform duration-300 ease-in-out xl:left-[245px] ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-6">
        <h2 className="text-2xl font-semibold">Search</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={reset}
          className="rounded-full p-1"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Search input */}
      <div className="px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            className="h-10 w-full rounded-lg bg-zinc-100 pl-10 pr-10 text-sm outline-none placeholder:text-zinc-500 focus:bg-zinc-50"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-zinc-300 p-0.5 transition-colors hover:bg-zinc-400"
            >
              <X className="h-3 w-3 text-white" />
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      <ScrollArea className="flex-1">
        {debouncedQuery ? (
          <SearchResults
            users={users}
            tags={tags}
            isLoading={isLoading}
            onClose={handleClose}
          />
        ) : (
          <SearchResults
            users={users}
            tags={[]}
            isLoading={usersLoading}
            onClose={handleClose}
          />
        )}
      </ScrollArea>
    </div>
  );
};
