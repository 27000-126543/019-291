import { useOpinionStore } from "@/store/useOpinionStore";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const SENTIMENT_COLORS = {
  positive: "#52C41A",
  negative: "#FF4D4F",
  neutral: "#FA8C16",
};

const SENTIMENT_LABELS = {
  positive: "正面",
  negative: "负面",
  neutral: "中性",
};

export default function SentimentRing() {
  const { opinions } = useOpinionStore();

  const counts = opinions.reduce(
    (acc, op) => {
      acc[op.sentiment]++;
      return acc;
    },
    { positive: 0, negative: 0, neutral: 0 }
  );

  const total = opinions.length;

  const data = [
    { name: "正面", value: counts.positive, key: "positive" },
    { name: "负面", value: counts.negative, key: "negative" },
    { name: "中性", value: counts.neutral, key: "neutral" },
  ].filter((d) => d.value > 0);

  const dominantKey = (Object.keys(counts) as Array<keyof typeof counts>).reduce(
    (a, b) => (counts[a] >= counts[b] ? a : b)
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 }}
      className="glass-card p-6 h-full"
    >
      <h3 className="text-navy-100 font-semibold mb-4">情绪分布</h3>
      <div className="relative h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={SENTIMENT_COLORS[entry.key as keyof typeof SENTIMENT_COLORS]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#0A1628",
                border: "1px solid rgba(100, 139, 197, 0.3)",
                borderRadius: "8px",
                color: "#E6ECF5",
              }}
              formatter={(value: number) => [
                `${value}条 (${total > 0 ? ((value / total) * 100).toFixed(1) : 0}%)`,
                "数量",
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="stat-number text-4xl text-alert-blue glow-text-blue">{total}</span>
          <span className="text-navy-200/70 text-sm mt-1">总条数</span>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-2 px-3 py-1 rounded-full text-xs font-medium"
            style={{
              backgroundColor: `${SENTIMENT_COLORS[dominantKey]}20`,
              color: SENTIMENT_COLORS[dominantKey],
            }}
          >
            主导：{SENTIMENT_LABELS[dominantKey]}
          </motion.span>
        </div>
      </div>
      <div className="flex justify-center gap-6 mt-4">
        {Object.entries(SENTIMENT_LABELS).map(([key, label]) => (
          <div key={key} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: SENTIMENT_COLORS[key as keyof typeof SENTIMENT_COLORS] }}
            />
            <span className="text-navy-200/70 text-sm">
              {label}{" "}
              <span className="text-navy-100 font-medium">
                {counts[key as keyof typeof counts]}
              </span>
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
