import { motion } from "framer-motion";
import type { ActionRecord } from "@/types";
import { cn } from "@/lib/utils";
import ActionCard from "./ActionCard";

interface RiskColumnProps {
  level: "high" | "medium" | "low";
  title: string;
  colorClass: string;
  actions: ActionRecord[];
  onEdit?: (action: ActionRecord) => void;
}

const levelConfig: Record<string, { dotColor: string; glowShadow: string; bgGradient: string }> = {
  high: {
    dotColor: "bg-alert-red",
    glowShadow: "shadow-glow-red",
    bgGradient: "from-alert-red/10 to-transparent",
  },
  medium: {
    dotColor: "bg-alert-orange",
    glowShadow: "shadow-glow-orange",
    bgGradient: "from-alert-orange/10 to-transparent",
  },
  low: {
    dotColor: "bg-alert-green",
    glowShadow: "shadow-glow-green",
    bgGradient: "from-alert-green/10 to-transparent",
  },
};

export default function RiskColumn({ level, title, colorClass, actions, onEdit }: RiskColumnProps) {
  const config = levelConfig[level];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col h-full min-h-0"
    >
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-3">
          <div className={cn("w-3 h-3 rounded-full", config.dotColor, config.glowShadow)} />
          <h3 className={cn("text-lg font-semibold", colorClass)}>{title}</h3>
        </div>
        <span
          className={cn(
            "px-2.5 py-0.5 rounded-full text-sm font-medium tabular-nums",
            level === "high" && "bg-alert-red/15 text-alert-red",
            level === "medium" && "bg-alert-orange/15 text-alert-orange",
            level === "low" && "bg-alert-green/15 text-alert-green"
          )}
        >
          {actions.length}
        </span>
      </div>

      <div
        className={cn(
          "flex-1 rounded-lg p-3 min-h-0 overflow-y-auto",
          "bg-gradient-to-b",
          config.bgGradient,
          "border border-navy-700/30"
        )}
      >
        {actions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12 text-navy-200/40">
            <p className="text-sm">暂无处置项</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {actions.map((action, index) => (
              <ActionCard
                key={action.id}
                action={action}
                index={index}
                onEdit={onEdit}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
