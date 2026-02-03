import { type Server as HttpServer } from 'http';

import { Server } from 'socket.io';
import { z } from 'zod';

import { env } from '../config';
import { verifyAccessToken } from '../utils';
import { objectIdSchema } from '../validations/pagination';
import * as chatService from '../services/chat.service';

const messageSendSchema = z.object({
  conversationId: objectIdSchema('conversation ID'),
  text: z.string().trim().min(1).max(2000),
});

type MessageSendPayload = z.infer<typeof messageSendSchema>;

type MessageSendAck = (response: {
  message?: chatService.MessageItem;
  error?: { code: string; message: string };
}) => void;

let io: Server | null = null;

export const initializeSocket = (httpServer: HttpServer): Server => {
  if (io) {
    return io;
  }

  io = new Server(httpServer, {
    cors: {
      origin: env.CLIENT_ORIGIN,
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;

    if (!token || typeof token !== 'string') {
      return next(new Error('UNAUTHORIZED'));
    }

    try {
      const payload = verifyAccessToken(token);
      if (!payload.sub || typeof payload.sub !== 'string') {
        return next(new Error('UNAUTHORIZED'));
      }

      socket.data.userId = payload.sub;
      return next();
    } catch {
      return next(new Error('UNAUTHORIZED'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data.userId as string;
    socket.join(`user:${userId}`);

    socket.on(
      'message:send',
      async (payload: MessageSendPayload, ack?: MessageSendAck) => {
        const parsed = messageSendSchema.safeParse(payload);

        if (!parsed.success) {
          ack?.({
            error: {
              code: 'VALIDATION_ERROR',
              message: parsed.error.issues[0]?.message ?? 'Invalid payload',
            },
          });
          return;
        }

        try {
          const message = await chatService.sendMessage(
            userId,
            parsed.data.conversationId,
            parsed.data.text,
          );

          if (io) {
            await chatService.broadcastNewMessage(
              io,
              parsed.data.conversationId,
              userId,
              message,
            );
          }

          ack?.({ message });
        } catch {
          ack?.({
            error: { code: 'UNKNOWN_ERROR', message: 'Failed to send message' },
          });
        }
      },
    );
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }

  return io;
};
