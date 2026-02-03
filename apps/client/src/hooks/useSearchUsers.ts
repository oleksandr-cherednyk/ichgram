import { useQuery } from '@tanstack/react-query';

import { apiRequest } from '../lib/api';
import type { SearchUsersResponse } from '../types/search';

/**
 * Hook to search users by username or fullName
 * When query is empty, returns suggested users
 */
export const useSearchUsers = (query: string) => {
  return useQuery({
    queryKey: ['users', 'search', query],
    queryFn: () => {
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      params.set('limit', '10');
      return apiRequest<SearchUsersResponse>(`/users/search?${params}`);
    },
    staleTime: 30000,
  });
};
