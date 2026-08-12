import React, { useState, useRef, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import Markdown from 'react-markdown';
import { cn } from '../lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIAdvisor() {
  const { transactions, goals, accounts } = useFinance();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Olá! Sou seu **Consultor Financeiro Inteligente**. Posso analisar seus gastos, as instituições financeiras que utiliza e simular o impacto das suas despesas nas suas metas.\n\nO que você gostaria de explorar hoje?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: userMsg,
          transactions,
          goals,
          accounts
        })
      });

      const data = await res.json();
      
      if (res.ok) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: `**Erro:** ${data.error || 'Ocorreu um erro ao consultar o assistente.'}` }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: '**Erro de conexão.** Não foi possível contactar o servidor.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-14rem)] lg:h-[calc(100vh-6rem)] max-h-[850px] bg-white dark:bg-zinc-900 rounded-[2rem] shadow-sm border border-zinc-200/60 dark:border-zinc-800/60 overflow-hidden">
      
      <div className="bg-white dark:bg-zinc-900 p-6 flex items-center space-x-4 border-b border-zinc-200/60 dark:border-zinc-800/60 relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
           <Bot size={120} />
        </div>
        <div className="p-3 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl shadow-md text-white relative z-10">
          <Sparkles size={24} />
        </div>
        <div className="relative z-10">
          <h2 className="font-bold text-xl font-heading text-zinc-900 dark:text-white leading-tight">FinControl Intelligence</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Análise cognitiva do seu perfil financeiro</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 bg-zinc-50 dark:bg-zinc-950/50">
        {messages.map((msg, idx) => (
          <div key={idx} className={cn("flex items-start space-x-3 max-w-[90%] md:max-w-[85%]", msg.role === 'user' ? "ml-auto flex-row-reverse space-x-reverse" : "")}>
            <div className={cn(
              "w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm relative overflow-hidden",
              msg.role === 'user' ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900" : "bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 border border-zinc-200/50 dark:border-zinc-700/50"
            )}>
              {msg.role === 'user' ? <User size={18} /> : <Bot size={20} />}
            </div>
            <div className={cn(
              "px-6 py-4 rounded-[1.5rem] text-sm shadow-sm",
              msg.role === 'user' 
                ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-tr-none" 
                : "bg-white dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700/60 text-zinc-700 dark:text-zinc-200 rounded-tl-none leading-relaxed"
            )}>
              {msg.role === 'user' ? (
                <p>{msg.content}</p>
              ) : (
                <div className="markdown-body prose prose-sm prose-zinc dark:prose-invert max-w-none">
                  <Markdown>{msg.content}</Markdown>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start space-x-3 max-w-[85%]">
             <div className="w-10 h-10 rounded-2xl bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 border border-zinc-200/50 dark:border-zinc-700/50 flex items-center justify-center flex-shrink-0 shadow-sm">
              <Bot size={20} />
            </div>
            <div className="px-6 py-5 rounded-[1.5rem] bg-white dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700/60 rounded-tl-none shadow-sm flex items-center space-x-3">
              <Loader2 size={18} className="text-indigo-500 animate-spin" />
              <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Processando dados financeiros...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 md:p-6 bg-white dark:bg-zinc-900 border-t border-zinc-200/60 dark:border-zinc-800/60 shrink-0">
        <form onSubmit={handleSubmit} className="relative max-w-4xl mx-auto flex items-center">
          <input 
            type="text" 
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Pergunte sobre seus gastos, peça dicas de economia..."
            className="w-full pl-6 pr-16 py-4 bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-500/50 text-sm dark:text-zinc-100 transition-shadow"
            disabled={isLoading}
          />
          <button 
            type="submit" 
            disabled={isLoading || !input.trim()}
            className="absolute right-2.5 p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition shadow-sm"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
