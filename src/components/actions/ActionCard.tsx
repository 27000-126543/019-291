import { motion } from "framer-motion";
import { Users, Calendar, MessageSquare } from "lucide-react";
import type { ActionRecord } from "@/types";
import { cn } from "@/lib/utils";

interface ActionCardProps {
  action: ActionRecord;
  index?: number;
  onEdit?: (action: ActionRecord) => void;
}

const STATUS_LABELS: Record<string, string> = {
  pending: "待处理",
  in_progress: "进行中",
  done: "已完成",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-navy-600/50 text-navy-100",
  in_progress: "bg-alert-blue/15 text-alert-blue",
  done: "bg-alert-green/15 text-alert-green",
};

const DEPARTMENT_LABELS: Record<string, string> = {
  pr: "公关",
  legal: "法务",
  cs: "客服",
  qa: "质量",
};

const DEPARTMENT_COLORS: Record<string, string> = {
  pr: "bg-navy-300/15 text-navy-100",
  legal: "bg-alert-blue/15 text-alert-blue",
  cs: "bg-alert-green/15 text-alert-green",
  qa: "bg-alert-orange/15 text-alert-orange",
};

const RISK_BORDER: Record<string, string> = {
  high: "border-l-alert-red",
  medium: "border-l-alert-orange",
  low: "border-l-alert-green",
};

const RISK_GLOW: Record<string, string> = {
  high: "hover:shadow-glow-red",
  medium: "hover:shadow-glow-orange",
  low: "hover:shadow-glow-green",
};

export default function ActionCard({ action, index = 0, onEdit }: ActionCardProps) {
  const totalUpdates = action.updates.length;
  const latestUpdate = action.updates[action.updates.length - 1];
  const progress = action.status === "done" ? 100 : totalUpdates > 0 ? Math.min(totalUpdates * 25, 75) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onClick={() => onEdit?.(action)}
      className={cn(
        "glass-card overflow-hidden cursor-pointer group",
        "transition-all duration-300 hover:shadow-card",
        RISK_GLOW[action.riskLevel],
        "border-l-4",
        RISK_BORDER[action.riskLevel]
      )}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={cn(
                "px-2 py-0.5 rounded text-xs font-medium",
                STATUS_COLORS[action.status]
              )}
            >
              {STATUS_LABELS[action.status]}
            </span>
            <span
              className={cn(
                "px-2 py-0.5 rounded text-xs font-medium",
                DEPARTMENT_COLORS[action.department]
              )}
            >
              {DEPARTMENT_LABELS[action.department]}
            </span>
          </div>
        </div>

        <h4 className="text-navy-50 font-semibold text-base leading-snug mb-1.5 group-hover:text-white transition-colors line-clamp-1">
          {action.title}
        </h4>

        <p className="text-navy-200/60 text-sm mb-3 line-clamp-2">
          {action.description}
        </p>

        <div className="flex items-center gap-4 text-xs text-navy-200/50 mb-3">
          <div className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            <span>{action.owner}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{action.deadline}</span>
          </div>
        </div>

        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-navy-200/50">进度</span>
            <span className="text-xs font-medium text-navy-100 tabular-nums">{progress}%</span>
          </div>
          <div className="h-1.5 bg-navy-700/50 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ delay: index * 0.05 + 0.2, duration: 0.5 }}
              className={cn(
                "h-full rounded-full",
                action.status === "done"
                  ? "bg-alert-green"
                  : action.riskLevel === "high"
                  ? "bg-alert-red"
                  : action.riskLevel === "medium"
                  ? "bg-alert-orange"
                  : "bg-alert-green"
              )}
            />
          </div>
        </div>

        {latestUpdate && (
          <div className="flex items-start gap-2 pt-3 border-t border-navy-700/40">
            <MessageSquare className="w-3.5 h-3.5 text-navy-200/40 mt-0.5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-navy-200/70 line-clamp-1">{latestUpdate.content}</p>
              <p className="text-xs text-navy-200/40 mt-0.5">
                {latestUpdate.operator} · {latestUpdate.time}
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
