import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  change: number;
  trend: "up" | "down" | "flat";
  color: "red" | "orange" | "green" | "blue";
}

const colorMap = {
  red: {
    text: "text-alert-red",
    glow: "glow-text-red",
    shadow: "shadow-glow-red",
    bg: "from-alert-red/20 to-transparent",
  },
  orange: {
    text: "text-alert-orange",
    glow: "glow-text-orange",
    shadow: "shadow-glow-orange",
    bg: "from-alert-orange/20 to-transparent",
  },
  green: {
    text: "text-alert-green",
    glow: "glow-text-green",
    shadow: "shadow-glow-green",
    bg: "from-alert-green/20 to-transparent",
  },
  blue: {
    text: "text-alert-blue",
    glow: "glow-text-blue",
    shadow: "shadow-glow",
    bg: "from-alert-blue/20 to-transparent",
  },
};

export default function StatCard({ title, value, change, trend, color }: StatCardProps) {
  const colors = colorMap[color];

  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className={cn(
        "glass-card p-6 relative overflow-hidden group cursor-pointer",
        "transition-all duration-300 hover:shadow-card"
      )}
    >
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500", colors.bg)} />
      <div className="relative z-10">
        <p className="text-navy-200/70 text-sm mb-3">{title}</p>
        <div className="flex items-end justify-between">
          <motion.span
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring" }}
            className={cn(
              "stat-number text-4xl md:text-5xl",
              colors.text,
              colors.glow
            )}
          >
            {typeof value === "number" ? value.toLocaleString() : value}
          </motion.span>
          <motion.div
            initial={{ x: 10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-md text-sm font-medium",
              trend === "up" && "bg-alert-red/10 text-alert-red",
              trend === "down" && "bg-alert-green/10 text-alert-green",
              trend === "flat" && "bg-navy-600/30 text-navy-200"
            )}
          >
            <TrendIcon className="w-4 h-4" />
            <span>{change > 0 ? "+" : ""}{change}%</span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
