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
  Legend,
} from "recharts";

const PLATFORM_LABELS: Record<string, string> = {
  news: "新闻媒体",
  video: "短视频",
  forum: "论坛社区",
  social: "社交平台",
};

export default function PlatformChart() {
  const { opinions } = useOpinionStore();

  const platformData = ["news", "video", "forum", "social"].map((platform) => {
    const platformOps = opinions.filter((op) => op.platform === platform);
    return {
      platform: PLATFORM_LABELS[platform],
      正面: platformOps.filter((op) => op.sentiment === "positive").length,
      负面: platformOps.filter((op) => op.sentiment === "negative").length,
      中性: platformOps.filter((op) => op.sentiment === "neutral").length,
    };
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
      className="glass-card p-6 h-full"
    >
      <h3 className="text-navy-100 font-semibold mb-4">平台分布</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={platformData}
            layout="vertical"
            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(100, 139, 197, 0.15)"
              horizontal={true}
              vertical={false}
            />
            <XAxis
              type="number"
              stroke="rgba(226, 236, 245, 0.4)"
              tick={{ fill: "rgba(226, 236, 245, 0.5)", fontSize: 12 }}
            />
            <YAxis
              type="category"
              dataKey="platform"
              stroke="rgba(226, 236, 245, 0.4)"
              tick={{ fill: "rgba(226, 236, 245, 0.7)", fontSize: 12 }}
              width={70}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0A1628",
                border: "1px solid rgba(100, 139, 197, 0.3)",
                borderRadius: "8px",
                color: "#E6ECF5",
              }}
              cursor={{ fill: "rgba(24, 144, 255, 0.05)" }}
            />
            <Legend
              wrapperStyle={{ color: "rgba(226, 236, 245, 0.7)", fontSize: 12 }}
              iconType="circle"
            />
            <Bar
              dataKey="正面"
              stackId="a"
              fill="#52C41A"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="中性"
              stackId="a"
              fill="#FA8C16"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="负面"
              stackId="a"
              fill="#FF4D4F"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
