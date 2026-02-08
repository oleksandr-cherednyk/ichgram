import { useState } from 'react';

import { useSendMessage } from '../../hooks';

type ChatInputProps = {
  conversationId: string;
};

export const ChatInput = ({ conversationId }: ChatInputProps) => {
  const sendMessage = useSendMessage();
  const [text, setText] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    sendMessage.mutate(
      { conversationId, text: trimmed },
      {
        onSuccess: () => {
          setText('');
        },
      },
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="sticky bottom-0 flex-shrink-0 border-t border-zinc-100 bg-white px-4 py-3 md:border-t-0"
    >
      <div className="flex w-full items-center gap-3 rounded-full border border-zinc-200 px-4 py-2 md:px-16">
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Write message..."
          className="flex-1 border-none bg-transparent text-sm outline-none placeholder:text-zinc-400"
        />
        <button
          type="submit"
          disabled={!text.trim() || sendMessage.isPending}
          className="text-sm font-semibold text-[#4D00FF] hover:text-[#3D00CC] disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </form>
  );
};
