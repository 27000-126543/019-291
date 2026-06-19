import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  Clock,
  CheckCircle,
  Eye,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { useOpinionStore } from "@/store/useOpinionStore";
import type { TriggeredAlert, OpinionItem } from "@/types";
import { cn } from "@/lib/utils";
import OpinionCard from "./OpinionCard";

const STATUS_CONFIG = {
  unhandled: {
    label: "未处理",
    color: "red",
    textClass: "text-alert-red",
    bgClass: "bg-alert-red/10",
    borderClass: "border-alert-red/20",
    dotClass: "bg-alert-red",
  },
  following: {
    label: "跟进中",
    color: "orange",
    textClass: "text-alert-orange",
    bgClass: "bg-alert-orange/10",
    borderClass: "border-alert-orange/20",
    dotClass: "bg-alert-orange",
  },
  resolved: {
    label: "已解决",
    color: "green",
    textClass: "text-alert-green",
    bgClass: "bg-alert-green/10",
    borderClass: "border-alert-green/20",
    dotClass: "bg-alert-green",
  },
} as const;

const PLATFORM_LABELS: Record<string, string> = {
  news: "新闻",
  video: "短视频",
  forum: "论坛",
  social: "社交",
};

const RULE_TYPE_LABELS: Record<string, string> = {
  negative_ratio: "负面占比预警",
  platform_spike: "单平台声量预警",
  competitor_trending: "竞品热搜预警",
};

function StatusBadge({ status }: { status: TriggeredAlert["status"] }) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        "px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5",
        config.bgClass,
        config.textClass
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", config.dotClass)} />
      {config.label}
    </span>
  );
}

interface AlertCardProps {
  alert: TriggeredAlert;
  relatedOpinions: OpinionItem[];
}

function AlertCard({ alert, relatedOpinions }: AlertCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { markAlertStatus } = useOpinionStore();
  const config = STATUS_CONFIG[alert.status];

  const handleMarkStatus = (
    e: React.MouseEvent,
    newStatus: TriggeredAlert["status"]
  ) => {
    e.stopPropagation();
    markAlertStatus(alert.id, newStatus);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "glass-card overflow-hidden border-l-4 transition-all duration-300",
        alert.status === "unhandled" && "border-l-alert-red",
        alert.status === "following" && "border-l-alert-orange",
        alert.status === "resolved" && "border-l-alert-green"
      )}
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1.5">
              <h4 className="text-navy-50 font-semibold text-base">
                {alert.ruleName}
              </h4>
              <StatusBadge status={alert.status} />
            </div>
            <div className="flex items-center gap-2 text-xs text-navy-200/50">
              <Clock className="w-3.5 h-3.5" />
              <span>{alert.triggeredAt}</span>
              <span className="w-1 h-1 rounded-full bg-navy-200/30" />
              <span>{RULE_TYPE_LABELS[alert.ruleType] || alert.ruleType}</span>
            </div>
          </div>
        </div>

        <div className={cn("p-3 rounded-lg mb-4", config.bgClass, config.borderClass, "border")}>
          <div className="flex items-center gap-2">
            <AlertCircle className={cn("w-4 h-4 shrink-0", config.textClass)} />
            <p className={cn("text-sm font-medium", config.textClass)}>
              {alert.detail}，超过阈值 {alert.threshold}
              {alert.ruleType === "negative_ratio" ? "%" : alert.ruleType === "platform_spike" ? " 条" : " 次"}
              ，当前值 {alert.currentValue}
              {alert.ruleType === "negative_ratio" ? "%" : alert.ruleType === "platform_spike" ? " 条" : " 次"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-4">
          {alert.involvedPlatforms && alert.involvedPlatforms.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-navy-200/50">涉及平台:</span>
              <div className="flex gap-1.5">
                {alert.involvedPlatforms.map((p) => (
                  <span
                    key={p}
                    className="px-2 py-0.5 rounded text-xs font-medium bg-navy-700/40 text-navy-100/80"
                  >
                    {PLATFORM_LABELS[p] || p}
                  </span>
                ))}
              </div>
            </div>
          )}

          {alert.involvedOpinionIds && alert.involvedOpinionIds.length > 0 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1.5 text-xs text-alert-blue hover:text-alert-blue/80 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>相关舆情 {alert.involvedOpinionIds.length} 条</span>
              {expanded ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {alert.status !== "following" && (
            <button
              onClick={(e) => handleMarkStatus(e, "following")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-alert-orange/10 text-alert-orange hover:bg-alert-orange/20 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              标记跟进中
            </button>
          )}
          {alert.status !== "resolved" && (
            <button
              onClick={(e) => handleMarkStatus(e, "resolved")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-alert-green/10 text-alert-green hover:bg-alert-green/20 transition-colors"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              标记已解决
            </button>
          )}
          {alert.status === "following" && (
            <button
              onClick={(e) => handleMarkStatus(e, "following")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-alert-blue/10 text-alert-blue hover:bg-alert-blue/20 transition-colors"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              继续跟进
            </button>
          )}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {expanded && relatedOpinions.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-2 border-t border-navy-700/30">
              <div className="text-xs text-navy-200/50 mb-3 font-medium">
                相关舆情列表
              </div>
              <div className="space-y-3">
                {relatedOpinions.map((opinion, idx) => (
                  <OpinionCard key={opinion.id} opinion={opinion} index={idx} />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function AlertCenter() {
  const { triggeredAlerts, opinions } = useOpinionStore();

  const stats = useMemo(() => {
    const unhandled = triggeredAlerts.filter(
      (a) => a.status === "unhandled"
    ).length;
    const following = triggeredAlerts.filter(
      (a) => a.status === "following"
    ).length;
    const resolved = triggeredAlerts.filter(
      (a) => a.status === "resolved"
    ).length;
    return { unhandled, following, resolved };
  }, [triggeredAlerts]);

  const getRelatedOpinions = (alert: TriggeredAlert): OpinionItem[] => {
    if (!alert.involvedOpinionIds || alert.involvedOpinionIds.length === 0) {
      return [];
    }
    return opinions.filter((op) =>
      alert.involvedOpinionIds?.includes(op.id)
    );
  };

  const sortedAlerts = useMemo(() => {
    const priorityOrder = { unhandled: 0, following: 1, resolved: 2 };
    return [...triggeredAlerts].sort((a, b) => {
      const statusDiff = priorityOrder[a.status] - priorityOrder[b.status];
      if (statusDiff !== 0) return statusDiff;
      return (
        new Date(b.triggeredAt).getTime() -
        new Date(a.triggeredAt).getTime()
      );
    });
  }, [triggeredAlerts]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card overflow-hidden"
    >
      <div className="p-5 border-b border-navy-700/30">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-lg bg-alert-red/10 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-alert-red" />
          </div>
          <div>
            <h3 className="text-navy-100 font-semibold text-lg">预警中心</h3>
            <p className="text-navy-200/50 text-sm">
              共 {triggeredAlerts.length} 条预警记录
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="p-4 rounded-lg bg-alert-red/5 border border-alert-red/15">
            <div className="flex items-center justify-between mb-2">
              <span className="text-navy-200/60 text-xs">未处理</span>
              <span className="w-2 h-2 rounded-full bg-alert-red" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-alert-red glow-text-red tabular-nums">
                {stats.unhandled}
              </span>
              <span className="text-xs text-navy-200/40">项</span>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-alert-orange/5 border border-alert-orange/15">
            <div className="flex items-center justify-between mb-2">
              <span className="text-navy-200/60 text-xs">跟进中</span>
              <span className="w-2 h-2 rounded-full bg-alert-orange" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-alert-orange glow-text-orange tabular-nums">
                {stats.following}
              </span>
              <span className="text-xs text-navy-200/40">项</span>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-alert-green/5 border border-alert-green/15">
            <div className="flex items-center justify-between mb-2">
              <span className="text-navy-200/60 text-xs">已解决</span>
              <span className="w-2 h-2 rounded-full bg-alert-green" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-alert-green glow-text-green tabular-nums">
                {stats.resolved}
              </span>
              <span className="text-xs text-navy-200/40">项</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-5">
        {sortedAlerts.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-navy-700/30 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-navy-200/40" />
            </div>
            <p className="text-navy-200/50 text-sm">
              暂无预警记录，当前系统运行正常
            </p>
          </div>
        ) : (
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {sortedAlerts.map((alert) => (
                  <AlertCard
                    key={alert.id}
                    alert={alert}
                    relatedOpinions={getRelatedOpinions(alert)}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
    </motion.div>
  );
}
