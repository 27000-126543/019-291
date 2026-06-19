import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  ComposedChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Label,
} from "recharts";
import { useOpinionStore } from "@/store/useOpinionStore";
import { TrendingUp } from "lucide-react";

const RESPONSE_TIME_POINT = "06-18 18:00";

export default function SentimentTrendChart() {
  const { sentimentTrend } = useOpinionStore();

  const chartData = useMemo(() => {
    return sentimentTrend.map((item) => ({
      ...item,
      responseLabel: item.time === RESPONSE_TIME_POINT ? "官方回应" : undefined,
    }));
  }, [sentimentTrend]);

  const hasResponsePoint = chartData.some((d) => d.responseLabel);

  interface TooltipPayloadEntry {
    name: string;
    value: number;
    color: string;
  }

  interface CustomTooltipProps {
    active?: boolean;
    payload?: TooltipPayloadEntry[];
    label?: string;
  }

  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card p-3 shadow-card border-navy-600/50">
          <p className="text-navy-100 text-sm font-medium mb-2">{label}</p>
          <div className="space-y-1.5">
            {payload.map((entry, index) => (
              <div key={index} className="flex items-center justify-between gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-navy-200/70">{entry.name}</span>
                </div>
                <span className="text-navy-50 font-medium tabular-nums">
                  {entry.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-alert-green/15 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-alert-green" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-navy-50">情绪变化趋势</h2>
            <p className="text-navy-200/50 text-sm">追踪不同时间段的舆情声量分布</p>
          </div>
        </div>
        <div className="flex items-center gap-5 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-alert-red shadow-glow-red" />
            <span className="text-navy-200/70">负面</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-alert-blue shadow-glow" />
            <span className="text-navy-200/70">中性</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-alert-green shadow-glow-green" />
            <span className="text-navy-200/70">正面</span>
          </div>
        </div>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="negativeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF4D4F" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#FF4D4F" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="neutralGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1890FF" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#1890FF" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="positiveGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#52C41A" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#52C41A" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(100, 139, 197, 0.15)"
              vertical={false}
            />
            <XAxis
              dataKey="time"
              stroke="rgba(100, 139, 197, 0.5)"
              tick={{ fill: "rgba(194, 209, 232, 0.6)", fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: "rgba(100, 139, 197, 0.2)" }}
            />
            <YAxis
              stroke="rgba(100, 139, 197, 0.5)"
              tick={{ fill: "rgba(194, 209, 232, 0.6)", fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="negative"
              name="负面"
              stroke="#FF4D4F"
              strokeWidth={2}
              fill="url(#negativeGradient)"
              dot={false}
              activeDot={{ r: 5, fill: "#FF4D4F", stroke: "#0A1628", strokeWidth: 2 }}
            />
            <Area
              type="monotone"
              dataKey="neutral"
              name="中性"
              stroke="#1890FF"
              strokeWidth={2}
              fill="url(#neutralGradient)"
              dot={false}
              activeDot={{ r: 5, fill: "#1890FF", stroke: "#0A1628", strokeWidth: 2 }}
            />
            <Area
              type="monotone"
              dataKey="positive"
              name="正面"
              stroke="#52C41A"
              strokeWidth={2}
              fill="url(#positiveGradient)"
              dot={false}
              activeDot={{ r: 5, fill: "#52C41A", stroke: "#0A1628", strokeWidth: 2 }}
            />
            {hasResponsePoint && (
              <ReferenceLine
                x={RESPONSE_TIME_POINT}
                stroke="#52C41A"
                strokeWidth={2}
                strokeDasharray="4 4"
              >
                <Label
                  value="官方回应"
                  position="top"
                  fill="#52C41A"
                  fontSize={12}
                  fontWeight={600}
                />
              </ReferenceLine>
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
