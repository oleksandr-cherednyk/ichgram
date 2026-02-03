import { useQuery } from '@tanstack/react-query';

import { apiRequest } from '../lib/api';
import type { SearchTagsResponse } from '../types/search';

/**
 * Hook to search tags by partial match
 * Only executes when query has at least 1 character
 */
export const useSearchTags = (query: string) => {
  return useQuery({
    queryKey: ['tags', 'search', query],
    queryFn: () => {
      const params = new URLSearchParams({ q: query });
      return apiRequest<SearchTagsResponse>(`/tags/search?${params}`);
    },
    enabled: query.length > 0,
    staleTime: 30000, // Cache for 30 seconds
  });
};
