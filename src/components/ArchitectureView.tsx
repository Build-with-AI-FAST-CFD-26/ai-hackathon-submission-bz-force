import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import mermaid from 'mermaid';
import { Workflow } from 'lucide-react';

interface ArchitectureViewProps {
  mermaidGraph: string;
}

mermaid.initialize({
  startOnLoad: true,
  theme: 'dark',
  securityLevel: 'loose',
  themeVariables: {
    background: '#151921',
    primaryColor: '#00F5FF',
    primaryTextColor: '#E5E7EB',
    primaryBorderColor: '#2D333F',
    lineColor: '#00F5FF',
    secondaryColor: '#FFB800',
    tertiaryColor: '#0A0C10',
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

      const normalizedGraph = normalizeMermaidGraph(mermaidGraph);

      if (!normalizedGraph) {
        setError('No architecture diagram returned yet. Run a fresh scan to generate one.');
        return;
      }

      try {
        const uniqueId = `mermaid-${Date.now()}`;
        const { svg } = await mermaid.render(uniqueId, normalizedGraph);
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch (renderError) {
        setError(renderError instanceof Error ? renderError.message : 'Failed to render architecture diagram.');
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
          <p className="text-xs text-gray-500 uppercase tracking-wider font-mono">Generated from the latest StackSense scan</p>
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

function normalizeMermaidGraph(graph: string) {
  return graph
    .replace(/```mermaid/gi, '')
    .replace(/```/g, '')
    .trim()
    .replace(/^graph\s+TD\s+/i, 'graph TD\n')
    .replace(/^flowchart\s+TD\s+/i, 'flowchart TD\n')
    .replace(/;\s*/g, '\n')
    .replace(/\n{3,}/g, '\n\n');
}
