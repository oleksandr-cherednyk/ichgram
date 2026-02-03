import { io, type Socket } from 'socket.io-client';

import { useAuthStore } from '../stores/auth';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    const token = useAuthStore.getState().accessToken;
    socket = io('/', {
      auth: { token },
      transports: ['websocket', 'polling'],
      autoConnect: false,
    });
  }

  return socket;
};

export const connectSocket = (): void => {
  const activeSocket = getSocket();
  if (!activeSocket.connected) {
    activeSocket.connect();
  }
};

export const disconnectSocket = (): void => {
  if (socket?.connected) {
    socket.disconnect();
  }
};

export const updateSocketToken = (token: string | null): void => {
  const activeSocket = getSocket();
  activeSocket.auth = { token };

  if (activeSocket.connected) {
    activeSocket.disconnect();
    activeSocket.connect();
  }
};
