import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { rupiah, compactNumber } from '../lib/format';

function toChartData(values) {
  return Object.entries(values ?? {}).map(([name, value]) => ({
    name,
    value: Number(value ?? 0),
  }));
}

export function MoneyBarChart({ values, height = 260, color = '#2563eb' }) {
  const data = toChartData(values);
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: '#64748b' }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
          minTickGap={20}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#64748b' }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => compactNumber(v)}
          width={80}
        />
        <Tooltip
          formatter={(value) => [rupiah(value), 'Nilai']}
          cursor={{ fill: '#f1f5f9' }}
          contentStyle={{ borderRadius: 12, borderColor: '#e2e8f0', fontSize: 12 }}
        />
        <Bar dataKey="value" fill={color} radius={[6, 6, 0, 0]} maxBarSize={36} />
      </BarChart>
    </ResponsiveContainer>
  );
}
