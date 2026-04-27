import { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Trash2, Cpu, DollarSign, Target, ShieldCheck } from 'lucide-react';
import { UserContext, StackItem } from '../types';
import { cn } from '../lib/utils';

interface OnboardingProps {
  onComplete: (context: UserContext) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [stack, setStack] = useState<StackItem[]>([
    { id: '1', name: 'Gemini 1.5 Pro', category: 'LLM', monthlyCost: 400 },
    { id: '2', name: 'Firebase', category: 'Backend', monthlyCost: 50 },
  ]);
  const [budget, setBudget] = useState(1000);
  const [focus, setFocus] = useState('Rapid Prototyping');

  const addStackItem = () => {
    const id = Math.random().toString(36).substr(2, 9);
    setStack([...stack, { id, name: '', category: 'SaaS', monthlyCost: 0 }]);
  };

  const removeStackItem = (id: string) => {
    setStack(stack.filter(item => item.id !== id));
  };

  const updateStackItem = (id: string, updates: Partial<StackItem>) => {
    setStack(stack.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleSubmit = () => {
    onComplete({
      onboarded: true,
      stack,
      monthlyBudget: budget,
      mainFocus: focus,
      riskTolerance: 'medium',
    });
  };

  const containerVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-20 min-h-screen flex flex-col justify-center">
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-brand-cyan/20 flex items-center justify-center border border-brand-cyan/30">
            <Cpu className="text-brand-cyan w-6 h-6" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">StackSense Config</h1>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div 
              key={i} 
              className={cn(
                "h-1 flex-1 rounded-full transition-all duration-500",
                step >= i ? "bg-brand-cyan" : "bg-brand-border"
              )}
            />
          ))}
        </div>
      </div>

      <div className="min-h-[400px]">
        {step === 1 && (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" exit="exit">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-brand-cyan" /> Define Your Core Stack
            </h2>
            <div className="space-y-4">
              {stack.map((item) => (
                <div key={item.id} className="flex gap-4 items-end bg-brand-card p-4 rounded-xl border border-brand-border hover:border-brand-cyan/30 transition-colors">
                  <div className="flex-1 space-y-2">
                    <label className="text-xs uppercase tracking-widest text-gray-500 font-mono">Provider/Tool</label>
                    <input 
                      type="text" 
                      value={item.name}
                      onChange={(e) => updateStackItem(item.id, { name: e.target.value })}
                      placeholder="e.g. Pinecone"
                      className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-2 focus:border-brand-cyan outline-none transition-colors"
                    />
                  </div>
                  <div className="w-32 space-y-2">
                    <label className="text-xs uppercase tracking-widest text-gray-500 font-mono">Monthly ($)</label>
                    <input 
                      type="number" 
                      value={item.monthlyCost}
                      onChange={(e) => updateStackItem(item.id, { monthlyCost: Number(e.target.value) })}
                      className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-2 focus:border-brand-cyan outline-none transition-colors"
                    />
                  </div>
                  <button 
                    onClick={() => removeStackItem(item.id)}
                    className="p-2.5 text-gray-500 hover:text-brand-red transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
              <button 
                onClick={addStackItem}
                className="w-full py-4 border-2 border-dashed border-brand-border rounded-xl text-gray-500 hover:text-brand-cyan hover:border-brand-cyan/50 hover:bg-brand-cyan/5 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" /> Add Tool to Inventory
              </button>
            </div>
            <div className="mt-12 flex justify-end">
              <button 
                onClick={nextStep}
                className="bg-brand-cyan text-brand-bg font-bold px-8 py-3 rounded-lg hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(0,245,255,0.3)]"
              >
                Initialize Subsystems
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" exit="exit">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-brand-cyan" /> Economic Constraints
            </h2>
            <div className="space-y-8 bg-brand-card p-8 rounded-2xl border border-brand-border">
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-400">Target Monthly Runway Offset ($)</label>
                <input 
                  type="range" 
                  min="0" 
                  max="10000" 
                  step="500"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full accent-brand-cyan"
                />
                <div className="flex justify-between text-mono text-brand-cyan font-bold text-xl">
                  <span>$0</span>
                  <span>${budget.toLocaleString()}</span>
                  <span>$10k+</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-400">Primary Strategic Focus</label>
                <div className="grid grid-cols-2 gap-4">
                  {['Cost Efficiency', 'Performance Scalability', 'Ecosystem Agility', 'Rapid Prototyping'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFocus(f)}
                      className={cn(
                        "p-4 rounded-xl border text-left transition-all",
                        focus === f ? "bg-brand-cyan/10 border-brand-cyan text-brand-cyan shadow-[0_0_15px_rgba(0,245,255,0.1)]" : "bg-brand-bg border-brand-border text-gray-400 hover:border-gray-600"
                      )}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-12 flex justify-between">
              <button 
                onClick={prevStep}
                className="text-gray-500 font-bold px-8 py-3 rounded-lg hover:text-white transition-all underline underline-offset-8"
              >
                Back
              </button>
              <button 
                onClick={nextStep}
                className="bg-brand-cyan text-brand-bg font-bold px-8 py-3 rounded-lg hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,245,255,0.3)]"
              >
                Finalize Configuration
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="text-center py-10">
            <div className="mb-10 inline-flex items-center justify-center p-6 rounded-full bg-brand-cyan/10 border border-brand-cyan/20 animate-pulse">
               <ShieldCheck className="w-20 h-20 text-brand-cyan" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Configuration Complete</h2>
            <p className="text-gray-400 max-w-md mx-auto mb-10">
              Your stack profile has been synthesized. StackSense is ready to deploy intelligence monitors.
            </p>
            <div className="bg-brand-card p-6 rounded-xl border border-brand-border text-left max-w-md mx-auto mb-12 font-mono text-sm space-y-2">
              <div className="flex justify-between border-b border-brand-border pb-2 mb-2">
                <span className="text-gray-500">SYSTEM_STATUS</span>
                <span className="text-brand-cyan">READY</span>
              </div>
              <p><span className="text-brand-amber text-xs">STK_01</span> {stack.length} components detected</p>
              <p><span className="text-brand-amber text-xs">BDG_01</span> Target focus: {focus}</p>
              <p><span className="text-brand-amber text-xs">RQK_01</span> Continuous scan enabled</p>
            </div>
            <button 
              onClick={handleSubmit}
              className="bg-brand-cyan text-brand-bg font-black uppercase tracking-widest px-12 py-5 rounded-lg hover:scale-110 active:scale-95 transition-all shadow-[0_0_30px_rgba(0,245,255,0.4)]"
            >
              Launch Dashboard
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
