'use client';

import { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { sendMessage, type ToolStep } from '@/lib/api';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  steps?: ToolStep[];
  error?: boolean;
}

const EXAMPLES = [
  '¿Cuánto sale el monitor con markup3?',
  '¿Qué productos tengo con poco stock?',
  'Registrá una venta de 1 mousepad al markup1 en efectivo',
  '¿Cuánto gané en total histórico?',
];

const uid = () => Math.random().toString(36).slice(2);

export function ChatClient() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function handleSend(text: string) {
    const content = text.trim();
    if (!content || loading) return;

    setInput('');
    setMessages((prev) => [...prev, { id: uid(), role: 'user', content }]);
    setLoading(true);

    try {
      const res = await sendMessage(content, conversationId);
      if (res.conversationId) setConversationId(res.conversationId);
      setMessages((prev) => [
        ...prev,
        { id: uid(), role: 'assistant', content: res.reply, steps: res.steps },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          role: 'assistant',
          content:
            'No pude conectarme con el asistente. ¿Está corriendo el backend en el puerto 3001?',
          error: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend(input);
    }
  }

  const empty = messages.length === 0;

  return (
    <div className="mx-auto flex h-dvh w-full max-w-2xl flex-col">
      {/* Header */}
      <header className="flex flex-col gap-1 border-b px-5 py-4">
        <h1 className="text-lg font-semibold tracking-tight">
          Asistente con Tool Calling
        </h1>
        <p className="text-sm text-muted-foreground">
          La IA ejecuta acciones reales sobre una base de datos en vivo.
        </p>
      </header>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto px-5 py-6">
        {empty ? (
          <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
            <div className="space-y-2">
              <p className="text-2xl">🛒</p>
              <p className="text-sm text-muted-foreground">
                Probá con uno de estos ejemplos:
              </p>
            </div>
            <div className="grid w-full gap-2 sm:grid-cols-2">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  onClick={() => void handleSend(ex)}
                  className="rounded-lg border bg-card p-3 text-left text-sm transition-colors hover:bg-accent"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} />
            ))}
            {loading && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t p-4">
        <div className="flex items-end gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Escribí tu pedido…  (Enter para enviar, Shift+Enter salto de línea)"
            rows={1}
            className="max-h-40 min-h-[44px] resize-none"
            disabled={loading}
          />
          <Button
            size="icon"
            className="h-11 w-11 shrink-0"
            onClick={() => void handleSend(input)}
            disabled={loading || !input.trim()}
            aria-label="Enviar"
          >
            <Send className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[85%] space-y-2 rounded-2xl px-4 py-2.5 text-sm',
          isUser
            ? 'bg-primary text-primary-foreground'
            : message.error
              ? 'bg-destructive/10 text-destructive'
              : 'bg-muted text-foreground',
        )}
      >
        <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
        {message.steps && message.steps.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {message.steps.map((s, i) => (
              <span
                key={i}
                title={JSON.stringify(s.args)}
                className="inline-flex items-center gap-1 rounded-full bg-background/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground ring-1 ring-border"
              >
                🔧 {s.tool}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-1 rounded-2xl bg-muted px-4 py-3">
        <span className="size-2 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.3s]" />
        <span className="size-2 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.15s]" />
        <span className="size-2 animate-bounce rounded-full bg-muted-foreground/60" />
      </div>
    </div>
  );
}
