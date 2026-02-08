import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { apiRequest } from '../lib/api';
import { disconnectSocket } from '../lib/socket';
import { useAuthStore } from '../stores/auth';

export const useLogout = () => {
  const navigate = useNavigate();
  const clear = useAuthStore((s) => s.clear);
  const queryClient = useQueryClient();

  return useCallback(async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } finally {
      disconnectSocket();
      clear();
      queryClient.clear();
      navigate('/login');
    }
  }, [clear, queryClient, navigate]);
};
