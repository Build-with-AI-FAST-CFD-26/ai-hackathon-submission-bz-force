import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import mermaid from 'mermaid';
import { Workflow } from 'lucide-react';

interface ArchitectureViewProps {
  mermaidGraph: string;
}

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  securityLevel: 'strict',
  themeVariables: {
    background: '#272727',
    primaryColor: '#ffe17c',
    primaryTextColor: '#E5E7EB',
    primaryBorderColor: '#b7c6c2',
    lineColor: '#ffe17c',
    secondaryColor: '#b7c6c2',
    tertiaryColor: '#171e19',
  },
});

export default function ArchitectureView({ mermaidGraph }: ArchitectureViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function renderDiagram() {
      if (!containerRef.current) {
        return;
      }

      containerRef.current.innerHTML = '';
      setError('');

      if (!mermaidGraph.trim()) {
        setError('No architecture diagram returned yet. Run a fresh scan to generate one.');
        return;
      }

      try {
        const uniqueId = `mermaid-${Date.now()}`;
        const { svg } = await mermaid.render(uniqueId, mermaidGraph);
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch (renderError) {
        if (import.meta.env.DEV) console.error('Architecture diagram render failed', renderError);
        setError('The architecture diagram could not be displayed. Run the scan again or review the stack list instead.');
      }
    }

    void renderDiagram();

    return () => {
      cancelled = true;
    };
  }, [mermaidGraph]);

  return (
    <div className="space-y-6">
      <div className="bg-brand-card border border-brand-border rounded-2xl p-6 flex items-center gap-4">
        <div className="w-11 h-11 rounded-lg bg-brand-cyan/10 border border-brand-cyan/30 flex items-center justify-center">
          <Workflow className="w-5 h-5 text-brand-cyan" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Architecture Diagram</h2>
          <p className="text-xs text-gray-500 uppercase tracking-wider font-mono">Available only when returned by the latest successful scan</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-brand-card border border-brand-border rounded-2xl p-6 min-h-[520px] overflow-auto"
      >
        {error ? (
          <div className="text-brand-amber text-sm font-mono">{error}</div>
        ) : (
          <div ref={containerRef} className="flex justify-center items-center min-h-[460px] [&_svg]:max-w-full [&_svg]:h-auto" />
        )}
      </motion.div>
    </div>
  );
}
