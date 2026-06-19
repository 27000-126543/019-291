import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Bell,
  BellRing,
  ShieldAlert,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { useOpinionStore } from "@/store/useOpinionStore";
import type { AlertRule, TriggeredAlert } from "@/types";
import { cn } from "@/lib/utils";
import AlertCenter from "./AlertCenter";

const PLATFORM_LABELS: Record<string, string> = {
  news: "新闻",
  video: "视频",
  forum: "论坛",
  social: "社交",
};

interface ComputeResult {
  rule: AlertRule;
  value: number;
  detail: string;
  involvedPlatforms?: string[];
  involvedOpinionIds?: string[];
}

function computeAlerts(
  rules: AlertRule[],
  opinions: ReturnType<typeof useOpinionStore.getState>["opinions"],
  competitors: string[]
): ComputeResult[] {
  const triggered: ComputeResult[] = [];

  for (const rule of rules) {
    if (!rule.enabled) continue;

    if (rule.type === "negative_ratio") {
      const total = opinions.length;
      const negativeCount = opinions.filter(
        (o) => o.sentiment === "negative"
      ).length;
      const ratio = total > 0 ? (negativeCount / total) * 100 : 0;
      if (ratio > rule.threshold) {
        const negativeOpinions = opinions.filter(
          (o) => o.sentiment === "negative"
        );
        const platforms = Array.from(
          new Set(negativeOpinions.map((o) => o.platform))
        );
        triggered.push({
          rule,
          value: Math.round(ratio * 10) / 10,
          detail: `负面占比 ${Math.round(ratio * 10) / 10}%`,
          involvedPlatforms: platforms,
          involvedOpinionIds: negativeOpinions.slice(0, 8).map((o) => o.id),
        });
      }
    }

    if (rule.type === "platform_spike") {
      const platformHeat: Record<string, number> = {};
      const platformOpinionIds: Record<string, string[]> = {};
      for (const op of opinions) {
        platformHeat[op.platform] = (platformHeat[op.platform] || 0) + op.heat;
        if (!platformOpinionIds[op.platform]) {
          platformOpinionIds[op.platform] = [];
        }
        platformOpinionIds[op.platform].push(op.id);
      }
      for (const [platform, totalHeat] of Object.entries(platformHeat)) {
        if (totalHeat > rule.threshold) {
          triggered.push({
            rule,
            value: totalHeat,
            detail: `${PLATFORM_LABELS[platform] || platform} 声量 ${totalHeat.toLocaleString()}（热度值）`,
            involvedPlatforms: [platform],
            involvedOpinionIds: platformOpinionIds[platform],
          });
          break;
        }
      }
    }

    if (rule.type === "competitor_trending") {
      let trendingCount = 0;
      const competitorOpinionIds: string[] = [];
      for (const competitor of competitors) {
        const matchingOps = opinions.filter(
          (op) =>
            op.title.includes(competitor) || op.summary.includes(competitor)
        );
        if (matchingOps.length > 0) {
          trendingCount++;
          matchingOps.forEach((op) => {
            if (!competitorOpinionIds.includes(op.id)) {
              competitorOpinionIds.push(op.id);
            }
          });
        }
      }
      if (trendingCount >= rule.threshold) {
        triggered.push({
          rule,
          value: trendingCount,
          detail: `${trendingCount} 个竞品出现相关舆情`,
          involvedOpinionIds: competitorOpinionIds.slice(0, 8),
        });
      }
    }
  }

  return triggered;
}

function isRecentTrigger(
  existingAlerts: TriggeredAlert[],
  ruleId: string,
  thresholdMinutes: number = 30
): boolean {
  const now = new Date();
  return existingAlerts.some((alert) => {
    if (alert.ruleId !== ruleId) return false;
    const triggeredTime = new Date(alert.triggeredAt.replace(" ", "T"));
    const diffMs = now.getTime() - triggeredTime.getTime();
    const diffMinutes = diffMs / (1000 * 60);
    return diffMinutes < thresholdMinutes;
  });
}

export default function AlertRulePanel() {
  const {
    alertRules,
    opinions,
    brandConfig,
    triggeredAlerts,
    toggleAlertRule,
    updateAlertRule,
    triggerAlert,
  } = useOpinionStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAlertCenter, setShowAlertCenter] = useState(false);

  const enabledCount = alertRules.filter((r) => r.enabled).length;

  const triggeredAlertResults = useMemo(
    () => computeAlerts(alertRules, opinions, brandConfig.competitors),
    [alertRules, opinions, brandConfig.competitors]
  );

  useEffect(() => {
    for (const result of triggeredAlertResults) {
      if (!isRecentTrigger(triggeredAlerts, result.rule.id)) {
        triggerAlert({
          ruleId: result.rule.id,
          ruleName: result.rule.name,
          ruleType: result.rule.type,
          currentValue: result.value,
          threshold: result.rule.threshold,
          status: "unhandled",
          detail: result.detail,
          involvedPlatforms: result.involvedPlatforms,
          involvedOpinionIds: result.involvedOpinionIds,
        });
      }
    }
  }, [triggeredAlertResults, triggeredAlerts, triggerAlert]);

  const handleThresholdChange = (ruleId: string, value: string) => {
    const num = parseInt(value, 10);
    if (!isNaN(num) && num >= 0) {
      updateAlertRule(ruleId, { threshold: num });
    }
  };

  const unhandledCount = triggeredAlerts.filter(
    (a) => a.status === "unhandled"
  ).length;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card mb-6 overflow-hidden"
      >
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-4 hover:bg-navy-700/20 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-alert-orange/10 flex items-center justify-center">
              {triggeredAlertResults.length > 0 ? (
                <BellRing className="w-5 h-5 text-alert-orange animate-pulse" />
              ) : (
                <Bell className="w-5 h-5 text-alert-orange" />
              )}
            </div>
            <div className="text-left">
              <h3 className="text-navy-100 font-semibold">预警规则配置</h3>
              <p className="text-navy-200/50 text-sm">
                已启用 {enabledCount}/{alertRules.length} 条规则
                {triggeredAlertResults.length > 0 &&
                  ` · ${triggeredAlertResults.length} 项预警触发`}
              </p>
            </div>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-navy-200/50"
          >
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </button>

        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 pt-2 border-t border-navy-700/30">
                <div className="space-y-3">
                  {alertRules.map((rule) => (
                    <div
                      key={rule.id}
                      className={cn(
                        "flex items-center gap-4 p-3 rounded-lg transition-colors",
                        rule.enabled
                          ? "bg-navy-900/40"
                          : "bg-navy-900/20 opacity-60"
                      )}
                    >
                      <button
                        onClick={() => toggleAlertRule(rule.id)}
                        className={cn(
                          "relative w-11 h-6 rounded-full transition-colors shrink-0",
                          rule.enabled ? "bg-alert-blue" : "bg-navy-700/60"
                        )}
                      >
                        <motion.span
                          layout
                          className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm"
                          style={{
                            left: rule.enabled ? "22px" : "2px",
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30,
                          }}
                        />
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="text-navy-100 text-sm font-medium">
                          {rule.name}
                        </div>
                        <div className="text-navy-200/50 text-xs truncate">
                          {rule.description}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <input
                          type="number"
                          value={rule.threshold}
                          onChange={(e) =>
                            handleThresholdChange(rule.id, e.target.value)
                          }
                          disabled={!rule.enabled}
                          className="w-20 bg-navy-900/60 border border-navy-700/50 rounded-md px-2 py-1 text-sm text-navy-100 text-center focus:outline-none focus:border-alert-blue/50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        />
                        <span className="text-navy-200/50 text-sm w-6">
                          {rule.unit}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {triggeredAlertResults.length > 0 && (
                  <div className="mt-4 p-3 rounded-lg bg-alert-red/10 border border-alert-red/20">
                    <div className="flex items-center gap-2 mb-2">
                      <ShieldAlert className="w-4 h-4 text-alert-red animate-glow-pulse" />
                      <span className="text-alert-red font-semibold text-sm animate-glow-pulse">
                        预警触发
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {triggeredAlertResults.map((alert, idx) => (
                        <div
                          key={`${alert.rule.id}-${idx}`}
                          className="flex items-center gap-2 text-sm"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-alert-red animate-pulse" />
                          <span className="text-navy-200/80">
                            {alert.rule.name}
                          </span>
                          <span className="text-alert-red font-medium">
                            {alert.detail}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {triggeredAlertResults.length === 0 && (
                  <div className="mt-4 p-3 rounded-lg bg-alert-green/5 border border-alert-green/10">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-alert-green" />
                      <span className="text-navy-200/50 text-sm">
                        当前无预警触发，所有指标正常
                      </span>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setShowAlertCenter(!showAlertCenter)}
                  className={cn(
                    "mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-300",
                    unhandledCount > 0
                      ? "bg-alert-red/10 text-alert-red hover:bg-alert-red/20 border border-alert-red/20"
                      : "bg-navy-700/40 text-navy-100 hover:bg-navy-700/60 border border-navy-600/30"
                  )}
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>进入预警中心</span>
                  {unhandledCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-alert-red text-white text-xs font-bold">
                      {unhandledCount}
                    </span>
                  )}
                  <motion.div
                    animate={{ rotate: showAlertCenter ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </motion.div>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence initial={false}>
        {showAlertCenter && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="mb-6 overflow-hidden"
          >
            <AlertCenter />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
