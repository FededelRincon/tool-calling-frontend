// Cliente del backend de tool calling (NestJS).

export interface ToolStep {
  tool: string;
  args: Record<string, unknown>;
  result: unknown;
}

export interface ChatResponse {
  reply: string;
  steps: ToolStep[];
  conversationId: string | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export async function sendMessage(
  message: string,
  conversationId?: string | null,
): Promise<ChatResponse> {
  const res = await fetch(`${API_URL}/tooling-chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      ...(conversationId ? { conversationId } : {}),
    }),
  });

  if (!res.ok) {
    throw new Error(`El servidor respondió ${res.status}`);
  }
  return (await res.json()) as ChatResponse;
}
