import React from 'react';
import { 
  ArrowLeft,
  Cpu,
  LogOut, 
  Activity, 
  Layers, 
  MessageSquare, 
  Database,
  BarChart3
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { DashboardTab, UserContext } from '../types';
import type { OperatingMode } from '../config/operatingMode';
import { cn } from '../lib/utils';

interface SidebarProps {
  context: UserContext;
  operatingMode: OperatingMode;
  activeFindingCount: number;
  onReset: () => void;
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  hasPendingRescan: boolean;
}

export default function Sidebar({ context, operatingMode, activeFindingCount, onReset, activeTab, onTabChange, hasPendingRescan }: SidebarProps) {
  return (
    <aside className="hidden lg:flex w-72 bg-brand-card border-r border-brand-border flex-col shrink-0">
      <div className="p-8">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-8 h-8 rounded bg-brand-cyan flex items-center justify-center">
            <Cpu className="text-brand-bg w-5 h-5" />
          </div>
          <span className="font-display text-2xl tracking-normal">STACKSENSE<span className="text-brand-cyan">.</span></span>
        </div>

        <Link to="/" className="min-h-11 mb-6 px-3 flex items-center gap-3 rounded-lg border border-brand-border text-sm text-gray-300 hover:border-brand-cyan hover:text-brand-cyan"><ArrowLeft className="w-4 h-4" /> Return to landing</Link>

        <div className="mb-10 bg-brand-bg/50 rounded-2xl p-5 border border-brand-border shadow-inner space-y-4">
          <div className="text-xs text-gray-400 uppercase tracking-widest">Workspace status</div>
          <div className="flex items-center justify-between text-xs"><span className="text-gray-400">Mode</span><strong className={operatingMode === 'demo' ? 'text-brand-amber' : operatingMode === 'live' ? 'text-emerald-300' : 'text-red-300'}>{operatingMode}</strong></div>
          <div className="flex items-center justify-between text-xs"><span className="text-gray-400">Components</span><strong>{context.stack.length}</strong></div>
          <div className="flex items-center justify-between text-xs"><span className="text-gray-400">Needs review</span><strong>{activeFindingCount}</strong></div>
          <div className="flex items-center justify-between text-xs"><span className="text-gray-400">Stack state</span><strong className={hasPendingRescan ? 'text-brand-amber' : 'text-gray-200'}>{hasPendingRescan ? 'Changes pending' : 'Up to date'}</strong></div>
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
            <div className="font-bold text-sm truncate">Demo Founder</div>
            <div className="text-[10px] text-gray-400 truncate">Demo Workspace</div>
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
