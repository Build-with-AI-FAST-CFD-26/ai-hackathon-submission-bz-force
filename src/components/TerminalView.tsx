import { useEffect, useRef } from 'react';

interface TerminalViewProps {
  messages: string[];
}

export default function TerminalView({ messages }: TerminalViewProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 p-5 text-sm leading-relaxed overflow-y-auto custom-scrollbar">
      {messages.length === 0 ? (
        <div className="text-gray-400">No scan activity yet.</div>
      ) : (
        <div className="space-y-1">
          {messages.map((msg, i) => {
             return (
               <div key={i} className="flex gap-3 py-2 border-b border-brand-border/60 last:border-0">
                 <span className="w-2 h-2 mt-1.5 rounded-full bg-brand-cyan shrink-0" aria-hidden="true" />
                 <span className="text-gray-300">
                   {msg}
                 </span>
               </div>
             )
          })}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
}
