import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { Workflow } from 'lucide-react';

interface ArchitectureViewProps {
  mermaidGraph: string;
}

mermaid.initialize({
  startOnLoad: false,
  theme: 'base',
  securityLevel: 'strict',
  themeVariables: {
    background: '#ffffff',
    primaryColor: '#ffe17c',
    primaryTextColor: '#111a14',
    primaryBorderColor: '#b7c6c2',
    lineColor: '#ffe17c',
    secondaryColor: '#b7c6c2',
    tertiaryColor: '#f4f5f2',
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
    <div className="architecture-view">
      <div className="architecture-heading">
        <div className="architecture-icon">
          <Workflow />
        </div>
        <div>
          <h2>Architecture diagram</h2>
          <p>Available only when returned by the latest successful scan</p>
        </div>
      </div>

      <div className="architecture-canvas">
        {error ? (
          <div className="architecture-empty">{error}</div>
        ) : (
          <div ref={containerRef} className="architecture-diagram" />
        )}
      </div>
    </div>
  );
}
