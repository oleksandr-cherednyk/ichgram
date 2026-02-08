import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { apiRequest } from '../lib/api';
import { disconnectSocket } from '../lib/socket';
import { useAuthStore } from '../stores/auth';

export const useDeleteAccount = () => {
  const navigate = useNavigate();
  const clear = useAuthStore((s) => s.clear);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiRequest('/users/me', { method: 'DELETE' }),
    onSuccess: () => {
      disconnectSocket();
      clear();
      queryClient.clear();
      navigate('/login');
    },
  });
};
