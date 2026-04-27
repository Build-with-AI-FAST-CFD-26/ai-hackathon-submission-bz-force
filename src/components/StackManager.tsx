import { FormEvent, useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Trash2, Wrench } from 'lucide-react';
import { StackItem } from '../types';

interface StackManagerProps {
  stack: StackItem[];
  onAddTool: (name: string, monthlyCost: number) => void;
  onUpdateTool: (itemId: string, updates: Partial<StackItem>) => void;
  onRemoveTool: (itemId: string) => void;
}

export default function StackManager({ stack, onAddTool, onUpdateTool, onRemoveTool }: StackManagerProps) {
  const [toolName, setToolName] = useState('');
  const [monthlyCost, setMonthlyCost] = useState('0');

  const handleAdd = (event: FormEvent) => {
    event.preventDefault();
    const normalizedName = toolName.trim();
    const parsedCost = Number(monthlyCost);

    if (!normalizedName || Number.isNaN(parsedCost) || parsedCost < 0) {
      return;
    }

    onAddTool(normalizedName, parsedCost);
    setToolName('');
    setMonthlyCost('0');
  };

  return (
    <div className="space-y-6">
      <div className="bg-brand-card border border-brand-border rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-brand-cyan/10 border border-brand-cyan/30 flex items-center justify-center">
            <Wrench className="w-5 h-5 text-brand-cyan" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Stack Manager</h2>
            <p className="text-xs text-gray-500 font-mono uppercase tracking-wider">Live inventory with edit controls</p>
          </div>
        </div>

        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <input
            value={toolName}
            onChange={(e) => setToolName(e.target.value)}
            placeholder="Tool Name (e.g. Supabase, Cloud Run)"
            className="md:col-span-7 bg-brand-bg border border-brand-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-cyan"
          />
          <input
            type="number"
            min="0"
            step="1"
            value={monthlyCost}
            onChange={(e) => setMonthlyCost(e.target.value)}
            placeholder="Monthly Cost"
            className="md:col-span-3 bg-brand-bg border border-brand-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-cyan"
          />
          <button
            type="submit"
            className="md:col-span-2 rounded-xl bg-brand-cyan text-brand-bg font-bold text-sm flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {stack.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            className="bg-brand-card border border-brand-border rounded-2xl p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500">Stack Tool</span>
              <button
                onClick={() => onRemoveTool(item.id)}
                className="text-gray-500 hover:text-brand-red transition-colors p-1"
                aria-label={`Remove ${item.name}`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <input
              value={item.name}
              onChange={(e) => onUpdateTool(item.id, { name: e.target.value })}
              className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-cyan"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                value={item.category}
                onChange={(e) => onUpdateTool(item.id, { category: e.target.value || 'SaaS' })}
                className="bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-cyan"
              />
              <input
                type="number"
                min="0"
                step="1"
                value={item.monthlyCost}
                onChange={(e) => onUpdateTool(item.id, { monthlyCost: Number(e.target.value) || 0 })}
                className="bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-cyan"
              />
            </div>
          </motion.div>
        ))}
      </div>

      {stack.length === 0 && (
        <div className="border border-dashed border-brand-border rounded-2xl p-10 text-center text-gray-500 text-sm">
          No tools in stack inventory. Add your first tool to begin analysis.
        </div>
      )}
    </div>
  );
}
