import { motion } from "framer-motion";
import { Users } from "lucide-react";
import type { ActionRecord } from "@/types";
import { cn } from "@/lib/utils";

interface MorningMeetingViewProps {
  actions: ActionRecord[];
  onEdit?: (action: ActionRecord) => void;
}

const RISK_CONFIG: Record<string, { bg: string; text: string; label: string; dot: string }> = {
  high: {
    bg: "bg-alert-red/15",
    text: "text-alert-red",
    label: "高风险",
    dot: "bg-alert-red",
  },
  medium: {
    bg: "bg-alert-orange/15",
    text: "text-alert-orange",
    label: "中风险",
    dot: "bg-alert-orange",
  },
};

const STATUS_LABELS: Record<string, string> = {
  pending: "待处理",
  in_progress: "进行中",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-navy-600/60 text-navy-100",
  in_progress: "bg-alert-blue/15 text-alert-blue",
};

export default function MorningMeetingView({ actions, onEdit }: MorningMeetingViewProps) {
  const filtered = actions.filter(
    (a) => (a.riskLevel === "high" || a.riskLevel === "medium") && (a.status === "pending" || a.status === "in_progress")
  );

  const sorted = [...filtered].sort((a, b) => {
    const levelOrder = { high: 0, medium: 1 } as const;
    if (levelOrder[a.riskLevel as keyof typeof levelOrder] !== levelOrder[b.riskLevel as keyof typeof levelOrder]) {
      return levelOrder[a.riskLevel as keyof typeof levelOrder] - levelOrder[b.riskLevel as keyof typeof levelOrder];
    }
    const statusOrder = { pending: 0, in_progress: 1 } as const;
    return statusOrder[a.status as keyof typeof statusOrder] - statusOrder[b.status as keyof typeof statusOrder];
  });

  return (
    <div className="w-full">
      <div className="glass-card p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-serif font-bold text-navy-50 mb-1">晨会聚焦</h2>
            <p className="text-navy-200/60 text-sm">待处理与进行中的高/中风险处置项</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-3xl font-serif font-bold text-alert-red tabular-nums">{sorted.length}</p>
              <p className="text-xs text-navy-200/50">待讨论项</p>
            </div>
          </div>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <p className="text-navy-200/40 text-lg">暂无待讨论的处置项</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sorted.map((action, index) => {
            const config = RISK_CONFIG[action.riskLevel];
            const padNum = String(index + 1).padStart(2, "0");

            return (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08 }}
                whileHover={{ x: 8, transition: { duration: 0.2 } }}
                onClick={() => onEdit?.(action)}
                className={cn(
                  "glass-card cursor-pointer group transition-all duration-300",
                  "hover:shadow-card overflow-hidden border-l-4",
                  action.riskLevel === "high" ? "border-l-alert-red hover:shadow-glow-red" : "border-l-alert-orange hover:shadow-glow-orange"
                )}
              >
                <div className="flex items-stretch">
                  <div
                    className={cn(
                      "flex items-center justify-center px-6 min-w-[100px]",
                      "bg-gradient-to-br from-navy-800/80 to-transparent"
                    )}
                  >
                    <span
                      className={cn(
                        "text-5xl font-serif font-bold tabular-nums",
                        action.riskLevel === "high" ? "text-alert-red glow-text-red" : "text-alert-orange glow-text-orange"
                      )}
                    >
                      {padNum}
                    </span>
                  </div>

                  <div className="flex-1 p-5 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span
                          className={cn(
                            "px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5",
                            config.bg,
                            config.text
                          )}
                        >
                          <span className={cn("w-2 h-2 rounded-full", config.dot)} />
                          {config.label}
                        </span>
                        <span
                          className={cn(
                            "px-3 py-1 rounded-full text-xs font-medium",
                            STATUS_COLORS[action.status]
                          )}
                        >
                          {STATUS_LABELS[action.status]}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-navy-200/60 flex-shrink-0">
                        <Users className="w-4 h-4" />
                        <span className="text-sm font-medium">{action.owner}</span>
                      </div>
                    </div>

                    <h3 className="text-xl font-semibold text-navy-50 mb-2 group-hover:text-white transition-colors leading-snug">
                      {action.title}
                    </h3>

                    <p className="text-navy-200/60 text-sm line-clamp-2">
                      {action.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
