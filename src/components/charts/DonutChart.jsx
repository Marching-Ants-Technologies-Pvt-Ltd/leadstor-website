// components/charts/DonutChart.tsx
'use client';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
  '#8B5CF6', '#EC4899', '#14B8A6', '#F97316',
  '#6B7280', '#9CA3AF', '#6366F1', '#D946EF',
  '#22D3EE', '#FBBF24', '#A78BFA', '#64748B',
];

export default function DonutChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={380}>  {/* ← was 480, now smaller */}
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="label"
          cx="50%"
          cy="50%"
          innerRadius={80}     // ← reduced from 100
          outerRadius={135}    // ← reduced from 170 (smaller donut)
          paddingAngle={3}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>

        <Tooltip
          formatter={(v, name) => [`${v} leads`, name]}
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            padding: '8px 12px',
          }}
        />

        <Legend
          layout="horizontal"
          verticalAlign="bottom"
          align="center"
          wrapperStyle={{
            fontSize: '12px',          
            paddingTop: '20px',      
            textAlign: 'center',
          }}
          formatter={(value, entry) => {
            const count = entry?.payload?.value ?? 0;
            return `${value} – ${count}`;
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}