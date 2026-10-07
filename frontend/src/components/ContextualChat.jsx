import React, { useEffect, useRef, useState } from 'react';
import { Bot, Loader2, RefreshCcw, Send, Sparkles, MessageSquare } from 'lucide-react';
import { sendChatMessage } from '../api/client';

const SUGGESTIONS = [
  'Why was this routed to this department?',
  'Draft a polite, empathetic reply to the customer',
  'What specific info should the agent request?',
  'Is this a high priority or routine issue?',
];

export default function ContextualChat({
  ticketText,
  predictedCategory,
  recommendedDepartment,
  confidencePercentage,
}) {
  const openingMessage = `Hello! I am your AI assistant for this ticket. The local ML model categorized this as "${predictedCategory?.replace(
    '_',
    ' '
  )}" (${confidencePercentage}% confidence) routed to ${recommendedDepartment}. What would you like to explore or draft?`;

  const [messages, setMessages] = useState([{ role: 'assistant', content: openingMessage }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [serviceStatus, setServiceStatus] = useState(null);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessage = async (customMessage) => {
    const message = (customMessage || input).trim();
    if (!message || isLoading) return;

    const userMessage = { role: 'user', content: message };
    const history = messages.map(({ role, content }) => ({ role, content }));

    setMessages((current) => [...current, userMessage]);
    setInput('');
    setError(null);
    setIsLoading(true);

    try {
      const result = await sendChatMessage({
        ticket_text: ticketText,
        predicted_category: predictedCategory,
        recommended_department: recommendedDepartment,
        confidence_percentage: confidencePercentage,
        conversation_history: history,
        message,
      });

      setMessages((current) => [...current, { role: 'assistant', content: result.reply }]);
      setServiceStatus(result.llm_status);
    } catch (requestError) {
      setError(requestError.message || 'The assistant could not answer right now.');
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{ role: 'assistant', content: openingMessage }]);
    setError(null);
    setServiceStatus(null);
  };

  return (
    <section className="overflow-hidden rounded-[32px] border border-[#231212]/10 bg-white shadow-lg transition-all">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#231212]/10 bg-[#f4f4f4] px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-[#231212] text-white">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#231212]">
                Contextual Ticket Assistant
              </h2>
              <span className="rounded-full bg-[#e3e2f7] px-2.5 py-0.5 text-[10px] font-bold text-[#231212]">
                Interactive
              </span>
            </div>
            <p className="text-xs text-[#231212]/60">
              Grounded strictly in current ticket & ML predictions
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={clearChat}
          className="inline-flex items-center gap-1.5 rounded-full border border-[#231212]/20 bg-white px-3.5 py-1.5 text-xs font-semibold text-[#231212] hover:bg-[#231212] hover:text-white transition-all"
        >
          <RefreshCcw className="h-3.5 w-3.5" />
          <span>Reset Chat</span>
        </button>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="border-b border-[#231212]/5 bg-white px-6 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold text-[#231212]/50 uppercase tracking-wider">
            Quick Inquiries:
          </span>
          {SUGGESTIONS.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => sendMessage(prompt)}
              disabled={isLoading}
              className="rounded-full bg-[#f4f4f4] hover:bg-[#e3e2f7] border border-[#231212]/10 px-3 py-1 text-xs font-medium text-[#231212] transition-all disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="max-h-[26rem] min-h-64 space-y-4 overflow-y-auto p-6 bg-white">
        {messages.map((message, index) => {
          const isUser = message.role === 'user';
          return (
            <div
              key={`${message.role}-${index}`}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#e3e2f7] text-[#231212]">
                  <Sparkles className="h-4 w-4" />
                </div>
              )}
              <div
                className={`max-w-[82%] rounded-[24px] px-5 py-3.5 text-sm leading-relaxed ${
                  isUser
                    ? 'rounded-tr-xs bg-[#231212] text-white shadow-sm'
                    : 'rounded-tl-xs bg-[#f4f4f4] text-[#231212] border border-[#231212]/5'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2.5 rounded-full bg-[#f4f4f4] px-4 py-2 text-xs font-medium text-[#231212]/70 w-fit">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-[#231212]" />
            <span>Consulting AI model with ticket context...</span>
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-800">
            {error}
          </div>
        )}

        {serviceStatus && serviceStatus !== 'success' && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
            AI note: The LLM key is in standby. Quick local classification remains 100% active.
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Chat Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
        className="flex gap-2 border-t border-[#231212]/10 bg-[#f4f4f4] p-4"
      >
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          disabled={isLoading}
          placeholder="Ask a question or request a draft response..."
          className="min-w-0 flex-1 rounded-full border border-[#231212]/15 bg-white px-5 py-3 text-sm text-[#231212] placeholder:text-[#231212]/40 outline-none focus:border-[#231212] transition-all"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#231212] px-6 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#231212]/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <span>Send</span>
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>
    </section>
  );
}
