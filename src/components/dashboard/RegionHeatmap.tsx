import { useOpinionStore } from "@/store/useOpinionStore";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const REGION_DATA = [
  { region: "广东", count: 5823 },
  { region: "北京", count: 4521 },
  { region: "上海", count: 3892 },
  { region: "浙江", count: 3210 },
  { region: "江苏", count: 2789 },
  { region: "四川", count: 2345 },
  { region: "山东", count: 1987 },
  { region: "湖北", count: 1654 },
  { region: "福建", count: 1432 },
  { region: "河南", count: 1123 },
];

function getHeatColor(count: number, max: number) {
  const ratio = count / max;
  if (ratio > 0.8) return "#FF4D4F";
  if (ratio > 0.6) return "#FA8C16";
  if (ratio > 0.4) return "#FAAD14";
  if (ratio > 0.2) return "#1890FF";
  return "#3E6AB3";
}

export default function RegionHeatmap() {
  const { opinions } = useOpinionStore();

  const regionCounts = opinions.reduce((acc, op) => {
    acc[op.region] = (acc[op.region] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const combinedData = REGION_DATA.map((item) => ({
    ...item,
    count: item.count + (regionCounts[item.region] || 0) * 100,
  }));

  const maxCount = Math.max(...combinedData.map((d) => d.count));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="glass-card p-6 h-full"
    >
      <h3 className="text-navy-100 font-semibold mb-4">地区声量 TOP10</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={combinedData}
            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(100, 139, 197, 0.15)"
              vertical={false}
            />
            <XAxis
              dataKey="region"
              stroke="rgba(226, 236, 245, 0.4)"
              tick={{ fill: "rgba(226, 236, 245, 0.7)", fontSize: 12 }}
              interval={0}
            />
            <YAxis
              stroke="rgba(226, 236, 245, 0.4)"
              tick={{ fill: "rgba(226, 236, 245, 0.5)", fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0A1628",
                border: "1px solid rgba(100, 139, 197, 0.3)",
                borderRadius: "8px",
                color: "#E6ECF5",
              }}
              cursor={{ fill: "rgba(24, 144, 255, 0.05)" }}
              formatter={(value: number) => [`${value.toLocaleString()} 条`, "声量"]}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {combinedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getHeatColor(entry.count, maxCount)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
