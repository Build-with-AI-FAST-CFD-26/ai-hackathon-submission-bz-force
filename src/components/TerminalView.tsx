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
    <div className="flex-1 p-4 font-mono text-[11px] leading-relaxed overflow-y-auto custom-scrollbar">
      {messages.length === 0 ? (
        <div className="text-gray-700 animate-pulse">S_SYSTEM_STANDBY... READY_FOR_SCAN_COMMAND</div>
      ) : (
        <div className="space-y-1">
          {messages.map((msg, i) => {
             const isSystem = msg.includes('[SYSTEM]');
             const isError = msg.includes('FAILED');
             const isSuccess = msg.includes('COMPLETE');
             
             return (
               <div key={i} className="flex gap-2">
                 <span className="text-gray-600 shrink-0">❱_</span>
                 <span className={cn(
                   isSystem && "text-brand-amber",
                   isError && "text-brand-red",
                   isSuccess && "text-emerald-400 font-bold",
                   !isSystem && !isError && !isSuccess && "text-gray-400"
                 )}>
                   {msg}
                 </span>
               </div>
             )
          })}
          <div className="terminal-cursor" />
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
