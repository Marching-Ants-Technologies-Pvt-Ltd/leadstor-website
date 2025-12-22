// import {
//   PieChart,
//   Pie,
//   Cell,
//   Tooltip,
//   ResponsiveContainer,
// } from 'recharts';

// const COLORS = [
//   '#6366F1', '#8B5CF6', '#EC4899', '#F97316',
//   '#14B8A6', '#0EA5E9', '#A855F7', '#F43F5E',
//   '#22C55E', '#EAB308', '#64748B'
// ];

// export default function DonutChart({ data, valueKey = 'value' }) {
//   return (
//     <ResponsiveContainer width="100%" height={320}>
//       <PieChart>
//         <Pie
//           data={data}
//           dataKey={valueKey}
//           nameKey="label"
//           innerRadius={70}
//           outerRadius={110}
//           paddingAngle={2}
//           label={({ name, value }) => `${name} - ${value}`}
//         >
//           {data.map((_, index) => (
//             <Cell
//               key={index}
//               fill={COLORS[index % COLORS.length]}
//             />
//           ))}
//         </Pie>
//         <Tooltip />
//       </PieChart>
//     </ResponsiveContainer>
//   );
// }

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = [
  '#4F46E5', '#6366F1', '#8B5CF6', '#EC4899',
  '#F97316', '#14B8A6', '#22C55E', '#EAB308',
];

export default function DonutChart({ data, valueKey = 'value' }) {

    const renderLabel = ({ percent, name, value }) => {
        if (percent < 0.06) return null; // hide small labels
        return `${name} - ${value}`;
    };

    return (
        <ResponsiveContainer width="100%" height={320}>
        <PieChart>
            <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            innerRadius={75}
            outerRadius={115}
            paddingAngle={1}
            labelLine={false}
            label={renderLabel}
            >
            {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
            </Pie>

            <Tooltip
            formatter={(v, n) => [`${v}`, n]}
            />

            <Legend
            layout="vertical"
            verticalAlign="middle"
            align="right"
            wrapperStyle={{ fontSize: 12 }}
            />
        </PieChart>
        </ResponsiveContainer>
    );
}

