import React from 'react';
import { 
  Cpu, 
  Settings, 
  LogOut, 
  Activity, 
  Layers, 
  MessageSquare, 
  Database,
  BarChart3
} from 'lucide-react';
import { DashboardTab, UserContext } from '../types';
import { cn } from '../lib/utils';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface SidebarProps {
  context: UserContext;
  healthScore: number;
  onReset: () => void;
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  hasPendingRescan: boolean;
}

export default function Sidebar({ context, healthScore, onReset, activeTab, onTabChange, hasPendingRescan }: SidebarProps) {
  const data = [
    { name: 'Health', value: healthScore },
    { name: 'Remaining', value: 100 - healthScore },
  ];

  const COLORS = ['#00F5FF', '#151921'];

  return (
    <aside className="w-72 bg-brand-card border-r border-brand-border flex flex-col shrink-0">
      <div className="p-8">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-8 h-8 rounded bg-brand-cyan flex items-center justify-center">
            <Cpu className="text-brand-bg w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight">StackSense</span>
        </div>

        {/* Health Gauge */}
        <div className="mb-10 bg-brand-bg/50 rounded-2xl p-6 border border-brand-border shadow-inner">
          <div className="text-xs font-mono text-gray-500 uppercase tracking-widest text-center mb-2">Stack Health</div>
          <div className="h-40 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={65}
                  paddingAngle={5}
                  dataKey="value"
                  startAngle={180}
                  endAngle={-180}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">{healthScore}</span>
              <span className="text-[10px] text-brand-cyan font-mono font-bold tracking-widest uppercase">Index</span>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-2">
            <div className="flex items-center justify-between text-[10px] font-mono text-gray-400">
              <span>SYNC_STABILITY</span>
              <span className="text-emerald-400">NOMINAL</span>
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-gray-400">
              <span>LATENCY_VAR</span>
              <span className="text-emerald-400">12MS</span>
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-gray-400">
              <span>STACK_STATE</span>
              <span className={cn(
                'px-2 py-0.5 rounded-full border',
                hasPendingRescan ? 'text-brand-amber border-brand-amber/40 bg-brand-amber/10 animate-pulse' : 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10'
              )}>
                {hasPendingRescan ? 'DIRTY / RESCAN' : 'SYNCED'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          <NavItem icon={<Activity className="w-4 h-4" />} label="Overview" active={activeTab === 'overview'} onClick={() => onTabChange('overview')} />
          <NavItem icon={<Layers className="w-4 h-4" />} label="Stack Manager" active={activeTab === 'stack'} onClick={() => onTabChange('stack')} />
          <NavItem icon={<BarChart3 className="w-4 h-4" />} label="Runway Projections" active={activeTab === 'runway'} onClick={() => onTabChange('runway')} />
          <NavItem icon={<Database className="w-4 h-4" />} label="Architecture" active={activeTab === 'architecture'} onClick={() => onTabChange('architecture')} />
          <NavItem icon={<MessageSquare className="w-4 h-4" />} label="Insights" active={activeTab === 'insights'} onClick={() => onTabChange('insights')} />
          <NavItem icon={<MessageSquare className="w-4 h-4" />} label="Weekly Digest" active={activeTab === 'digest'} onClick={() => onTabChange('digest')} />
        </nav>
      </div>

      <div className="mt-auto p-8 border-t border-brand-border space-y-4">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-brand-bg/30 border border-brand-border">
          <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-xs font-mono font-bold">FE</div>
          <div className="min-w-0">
            <div className="font-bold text-sm truncate">The Founder</div>
            <div className="text-[10px] text-gray-500 font-mono truncate lowercase">dark.flame282004@gmail.com</div>
          </div>
        </div>
        <button 
          onClick={onReset}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-500 hover:text-brand-red transition-colors group"
        >
          <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
          Reset Configuration
        </button>
      </div>
    </aside>
  );
}

function NavItem({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick: () => void }) {
  return (
    <button onClick={onClick} className={cn(
      "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group",
      active ? "bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20 px-5" : "text-gray-400 hover:bg-brand-bg hover:text-white"
    )}>
      <span className={cn("transition-transform group-hover:scale-110", active && "text-brand-cyan")}>{icon}</span>
      {label}
      {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-cyan shadow-[0_0_8px_rgba(0,245,255,0.8)]" />}
    </button>
  );
}
