import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Megaphone, Scale, Headphones, ShieldCheck, Copy, Check, Clock, Loader2, CheckCircle2, ChevronRight } from "lucide-react";
import { useOpinionStore } from "@/store/useOpinionStore";
import { cn } from "@/lib/utils";

const DEPARTMENT_CONFIG = {
  pr: { label: "公关部", icon: Megaphone, color: "text-alert-blue", bg: "bg-alert-blue/15" },
  legal: { label: "法务部", icon: Scale, color: "text-alert-orange", bg: "bg-alert-orange/15" },
  cs: { label: "客服部", icon: Headphones, color: "text-alert-green", bg: "bg-alert-green/15" },
  qa: { label: "质量部", icon: ShieldCheck, color: "text-purple-400", bg: "bg-purple-400/15" },
} as const;

const RISK_DISPLAY = {
  high: { label: "高风险", color: "text-alert-red", bg: "bg-alert-red/15", dot: "bg-alert-red" },
  medium: { label: "中风险", color: "text-alert-orange", bg: "bg-alert-orange/15", dot: "bg-alert-orange" },
  low: { label: "低风险", color: "text-alert-green", bg: "bg-alert-green/15", dot: "bg-alert-green" },
} as const;

const STATUS_DISPLAY = {
  pending: { label: "待处理", icon: Clock, color: "text-navy-200/60" },
  in_progress: { label: "进行中", icon: Loader2, color: "text-alert-blue" },
  done: { label: "已完成", icon: CheckCircle2, color: "text-alert-green" },
} as const;

function formatDate(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function MorningSummaryPanel() {
  const { actions } = useOpinionStore();
  const [copied, setCopied] = useState(false);

  const departments = useMemo(() => {
    const grouped = new Map<string, typeof actions>();
    for (const action of actions) {
      const list = grouped.get(action.department) ?? [];
      list.push(action);
      grouped.set(action.department, list);
    }

    const entries = Array.from(grouped.entries()).map(([dept, deptActions]) => {
      const highCount = deptActions.filter((a) => a.riskLevel === "high").length;
      const mediumCount = deptActions.filter((a) => a.riskLevel === "medium").length;
      const lowCount = deptActions.filter((a) => a.riskLevel === "low").length;
      const statusCounts = {
        pending: deptActions.filter((a) => a.status === "pending").length,
        in_progress: deptActions.filter((a) => a.status === "in_progress").length,
        done: deptActions.filter((a) => a.status === "done").length,
      };

      const latestUpdates = deptActions
        .filter((a) => a.updates.length > 0)
        .map((action) => {
          const latest = action.updates[action.updates.length - 1];
          return { action, latest };
        })
        .sort((a, b) => b.latest.time.localeCompare(a.latest.time));

      return { dept: dept as keyof typeof DEPARTMENT_CONFIG, actions: deptActions, highCount, mediumCount, lowCount, statusCounts, latestUpdates };
    });

    entries.sort((a, b) => b.highCount - a.highCount);
    return entries;
  }, [actions]);

  const generateSummaryText = (): string => {
    const date = formatDate();
    const lines: string[] = [`舆情晨会纪要 ${date}`, ""];

    const highRiskItems = actions.filter((a) => a.riskLevel === "high");
    if (highRiskItems.length > 0) {
      lines.push("【高风险事项】");
      highRiskItems.forEach((item, idx) => {
        const statusLabel = STATUS_DISPLAY[item.status].label;
        const owner = item.owner;
        lines.push(`${idx + 1}. ${item.title} - ${statusLabel}（${owner}）`);
      });
      lines.push("");
    }

    for (const dept of departments) {
      const config = DEPARTMENT_CONFIG[dept.dept];
      lines.push(`【${config.label}进展】`);
      if (dept.latestUpdates.length === 0) {
        const pendingActions = dept.actions.filter((a) => a.status === "pending");
        if (pendingActions.length > 0) {
          pendingActions.forEach((action) => {
            lines.push(`- ${action.title}：待处理（${action.owner}）`);
          });
        }
      } else {
        for (const { action, latest } of dept.latestUpdates) {
          lines.push(`- ${action.title}：${latest.content}`);
        }
        const noUpdatePending = dept.actions.filter((a) => a.updates.length === 0 && a.status === "pending");
        for (const action of noUpdatePending) {
          lines.push(`- ${action.title}：待处理（${action.owner}）`);
        }
      }
      lines.push("");
    }

    return lines.join("\n").trimEnd();
  };

  const handleCopy = async () => {
    const text = generateSummaryText();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-serif font-bold text-navy-50 mb-1">进展汇总</h2>
          <p className="text-navy-200/60 text-sm">各部门最新处置进展 · 按高风险优先排序</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCopy}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300",
            copied
              ? "bg-alert-green/20 text-alert-green border border-alert-green/30"
              : "bg-navy-600/60 text-navy-100 border border-navy-500/50 hover:bg-navy-500/60 hover:border-navy-400/50"
          )}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              <span>已复制</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>复制晨会纪要</span>
            </>
          )}
        </motion.button>
      </div>

      <div className="space-y-4">
        {departments.map((dept, idx) => {
          const config = DEPARTMENT_CONFIG[dept.dept];
          const Icon = config.icon;

          return (
            <motion.div
              key={dept.dept}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="rounded-xl border border-navy-600/40 bg-navy-800/30 overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-navy-700/40 bg-navy-800/50">
                <div className="flex items-center gap-3">
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", config.bg)}>
                    <Icon className={cn("w-4 h-4", config.color)} />
                  </div>
                  <span className="text-lg font-semibold text-navy-50">{config.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  {dept.highCount > 0 && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-alert-red/15 text-alert-red">
                      <span className="w-1.5 h-1.5 rounded-full bg-alert-red" />
                      {dept.highCount}高
                    </span>
                  )}
                  {dept.mediumCount > 0 && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-alert-orange/15 text-alert-orange">
                      <span className="w-1.5 h-1.5 rounded-full bg-alert-orange" />
                      {dept.mediumCount}中
                    </span>
                  )}
                  {dept.lowCount > 0 && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-alert-green/15 text-alert-green">
                      <span className="w-1.5 h-1.5 rounded-full bg-alert-green" />
                      {dept.lowCount}低
                    </span>
                  )}
                </div>
              </div>

              <div className="px-5 py-3 space-y-2.5">
                {dept.latestUpdates.map(({ action, latest }) => {
                  const riskCfg = RISK_DISPLAY[action.riskLevel];
                  return (
                    <div key={action.id} className="flex items-start gap-3 group">
                      <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
                        <span className={cn("w-1.5 h-1.5 rounded-full", riskCfg.dot)} />
                        <ChevronRight className="w-3 h-3 text-navy-400/60 group-hover:text-navy-200 transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-medium text-navy-100 truncate">{action.title}</span>
                        </div>
                        <p className="text-sm text-navy-200/70 leading-relaxed">{latest.content}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-navy-200/40">
                          <span>{latest.operator}</span>
                          <span>{latest.time}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {dept.actions.filter((a) => a.updates.length === 0).map((action) => (
                  <div key={action.id} className="flex items-start gap-3">
                    <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
                      <span className={cn("w-1.5 h-1.5 rounded-full", RISK_DISPLAY[action.riskLevel].dot)} />
                      <ChevronRight className="w-3 h-3 text-navy-400/60" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-navy-100">{action.title}</span>
                      <span className="text-sm text-navy-200/40 ml-2">暂无进展 · {action.owner}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-5 py-2.5 border-t border-navy-700/30 bg-navy-900/30 flex items-center gap-4">
                {(Object.entries(dept.statusCounts) as [keyof typeof STATUS_DISPLAY, number][]).map(([status, count]) => {
                  if (count === 0) return null;
                  const statusCfg = STATUS_DISPLAY[status];
                  const StatusIcon = statusCfg.icon;
                  return (
                    <div key={status} className="flex items-center gap-1.5 text-xs">
                      <StatusIcon className={cn("w-3 h-3", statusCfg.color)} />
                      <span className="text-navy-200/50">{statusCfg.label}</span>
                      <span className={cn("font-medium tabular-nums", statusCfg.color)}>{count}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
