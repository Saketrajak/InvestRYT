// ============================================================
// Investryt AI — Frontend Chat Client Hook
// ============================================================

import { useState, useCallback } from 'react';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const sendMessage = useCallback(async (
    messageText: string,
    companyName: string,
    ticker: string,
    context: any,
    persona: 'value' | 'growth' | 'bear' = 'value'
  ) => {
    if (!messageText.trim()) return;

    const userMessage: ChatMessage = { role: 'user', content: messageText };
    setMessages((prev) => [...prev, userMessage]);
    setChatLoading(true);
    setChatError(null);

    try {
      const response = await fetch(`${BACKEND_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyName,
          ticker,
          history: messages,
          message: messageText,
          context,
          persona,
        }),
      });

      if (!response.ok) {
        throw new Error(`Chat API error: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.reply) {
        const assistantMessage: ChatMessage = { role: 'assistant', content: data.reply };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error('Received empty response from chat agent');
      }
    } catch (err: any) {
      console.error('[useChat] Error sending message:', err);
      setChatError(err.message || 'Failed to send message to research assistant.');
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Apologies, I encountered an error while processing your request. Please check the network connection and try again.' },
      ]);
    } finally {
      setChatLoading(false);
    }
  }, [messages]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setChatError(null);
  }, []);

  return {
    messages,
    chatLoading,
    chatError,
    sendMessage,
    clearChat,
  };
}
