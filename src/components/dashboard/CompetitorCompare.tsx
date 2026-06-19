import { useOpinionStore } from "@/store/useOpinionStore";
import { motion } from "framer-motion";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

const MOCK_DATA = [
  { dimension: "声量", 本品牌: 85, 竞品A: 72, 竞品B: 68 },
  { dimension: "负面占比", 本品牌: 68, 竞品A: 45, 竞品B: 52 },
  { dimension: "传播速度", 本品牌: 78, 竞品A: 82, 竞品B: 65 },
  { dimension: "媒体关注度", 本品牌: 72, 竞品A: 68, 竞品B: 58 },
  { dimension: "用户讨论度", 本品牌: 88, 竞品A: 75, 竞品B: 70 },
];

export default function CompetitorCompare() {
  const { brandConfig } = useOpinionStore();

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4 }}
      className="glass-card p-6 h-full"
    >
      <h3 className="text-navy-100 font-semibold mb-4">竞品对比分析</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={MOCK_DATA} outerRadius="75%">
            <PolarGrid stroke="rgba(100, 139, 197, 0.2)" />
            <PolarAngleAxis
              dataKey="dimension"
              tick={{
                fill: "rgba(226, 236, 245, 0.7)",
                fontSize: 12,
              }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{
                fill: "rgba(226, 236, 245, 0.4)",
                fontSize: 10,
              }}
              axisLine={false}
              tickCount={5}
            />
            <Radar
              name={brandConfig.brandName}
              dataKey="本品牌"
              stroke="#1890FF"
              fill="#1890FF"
              fillOpacity={0.3}
              strokeWidth={2}
            />
            <Radar
              name={brandConfig.competitors[0] || "竞品A"}
              dataKey="竞品A"
              stroke="#FA8C16"
              fill="#FA8C16"
              fillOpacity={0.15}
              strokeWidth={2}
            />
            <Radar
              name={brandConfig.competitors[1] || "竞品B"}
              dataKey="竞品B"
              stroke="#52C41A"
              fill="#52C41A"
              fillOpacity={0.15}
              strokeWidth={2}
            />
            <Legend
              wrapperStyle={{ color: "rgba(226, 236, 245, 0.7)", fontSize: 12 }}
              iconType="circle"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0A1628",
                border: "1px solid rgba(100, 139, 197, 0.3)",
                borderRadius: "8px",
                color: "#E6ECF5",
              }}
              formatter={(value: number) => [`${value}分`, ""]}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
