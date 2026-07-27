import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiDelete, apiGet, apiPost } from '@/api/client';
import { ApiChatConversationSummary, ApiChatMessage, ApiChatResponse } from '@/api/types';

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export type ChatConversationSummary = {
  id: string;
  preview: string;
  createdAt: string;
};

export function useSendChatMessage() {
  return useMutation({
    mutationFn: ({ conversationId, message }: { conversationId: string | null; message: string }) =>
      apiPost<ApiChatResponse>('/chat', {
        conversation_id: conversationId ?? undefined,
        message,
      }),
  });
}

export function useConversations() {
  return useQuery({
    queryKey: ['chat-conversations'],
    queryFn: async () => {
      const summaries = await apiGet<ApiChatConversationSummary[]>('/chat/conversations');
      return summaries.map((s) => ({ id: s.id, preview: s.preview, createdAt: s.created_at }));
    },
    enabled: false,
  });
}

export function useConversationMessages(conversationId: string | null) {
  return useQuery({
    queryKey: ['chat-messages', conversationId],
    queryFn: async () => {
      const apiMessages = await apiGet<ApiChatMessage[]>(`/chat/${conversationId}/messages`);
      return apiMessages.map((m) => ({ id: m.id, role: m.role, content: m.content }));
    },
    enabled: false,
  });
}

export function useDeleteConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (conversationId: string) => apiDelete(`/chat/conversations/${conversationId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-conversations'] });
    },
  });
}
