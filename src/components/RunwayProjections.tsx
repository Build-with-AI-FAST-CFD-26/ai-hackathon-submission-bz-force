import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface RunwayProjectionsProps {
  currentMonthlySpend: number;
  implementedSavings: number;
}

export default function RunwayProjections({ currentMonthlySpend, implementedSavings }: RunwayProjectionsProps) {
  const optimizedBurn = Math.max(currentMonthlySpend - implementedSavings, 0);

  const chartData = Array.from({ length: 12 }, (_, index) => {
    const month = index + 1;
    return {
      month: `M${month}`,
      current: Number((currentMonthlySpend * month).toFixed(2)),
      optimized: Number((optimizedBurn * month).toFixed(2)),
    };
  });

  return (
    <div className="bg-brand-card border border-brand-border rounded-2xl p-6 h-[540px] flex flex-col">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-brand-cyan">Runway Projections</h2>
        <p className="text-xs font-mono uppercase tracking-wider text-gray-500">
          12-month burn comparison using implemented optimizations
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-brand-bg/70 border border-brand-border rounded-xl p-4">
          <div className="text-[10px] uppercase tracking-wider font-mono text-gray-500">Current Burn Rate</div>
          <div className="text-2xl font-bold text-brand-red mt-1">${currentMonthlySpend.toLocaleString()}/mo</div>
        </div>
        <div className="bg-brand-bg/70 border border-brand-border rounded-xl p-4">
          <div className="text-[10px] uppercase tracking-wider font-mono text-gray-500">Optimized Burn Rate</div>
          <div className="text-2xl font-bold text-brand-amber mt-1">${optimizedBurn.toLocaleString()}/mo</div>
        </div>
      </div>

      <div className="flex-1 bg-brand-bg/60 border border-brand-border rounded-xl p-3">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 12, right: 18, left: 12, bottom: 10 }}>
            <defs>
              <linearGradient id="currentBurn" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF4D4D" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#FF4D4D" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="optimizedBurn" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00F5FF" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#00F5FF" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#2D333F" strokeDasharray="3 3" />
            <XAxis dataKey="month" stroke="#9CA3AF" tick={{ fill: '#9CA3AF', fontSize: 11 }} />
            <YAxis stroke="#9CA3AF" tick={{ fill: '#9CA3AF', fontSize: 11 }} width={90} />
            <Tooltip
              contentStyle={{
                background: '#151921',
                border: '1px solid #2D333F',
                borderRadius: '10px',
                color: '#E5E7EB',
              }}
              labelStyle={{ color: '#00F5FF', fontFamily: 'JetBrains Mono, monospace' }}
            />
            <Legend wrapperStyle={{ color: '#D1D5DB', fontSize: 12 }} />
            <Area type="monotone" dataKey="current" name="Current Burn Rate" stroke="#FF4D4D" fillOpacity={1} fill="url(#currentBurn)" strokeWidth={2} />
            <Area type="monotone" dataKey="optimized" name="Optimized Burn Rate" stroke="#00F5FF" fillOpacity={1} fill="url(#optimizedBurn)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
