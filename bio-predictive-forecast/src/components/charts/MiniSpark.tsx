import { Area, AreaChart, ResponsiveContainer } from "recharts";

export const MiniSpark = ({ data, color = "hsl(var(--primary))" }: { data: number[]; color?: string }) => (
  <div className="h-12 w-full">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data.map((v, i) => ({ i, v }))}>
        <defs>
          <linearGradient id="sp" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.5} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.4} fill="url(#sp)" isAnimationActive />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);
