import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Copy,
  Check,
  Sun,
  Briefcase,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  ShieldCheck,
  Users,
  Target,
  Calendar,
  Flag,
  FileText,
  ArrowRight,
} from "lucide-react";
import { useOpinionStore } from "@/store/useOpinionStore";
import type { ActionRecord } from "@/types";
import { cn } from "@/lib/utils";

type ReportVersion = "morning" | "leader";

const DEPARTMENT_LABELS: Record<string, string> = {
  pr: "公关部",
  legal: "法务部",
  cs: "客服部",
  qa: "质量部",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "待处理",
  in_progress: "进行中",
  done: "已完成",
};

const RISK_LABELS: Record<string, string> = {
  high: "高风险",
  medium: "中风险",
  low: "低风险",
};

const NODE_TYPE_LABELS: Record<string, string> = {
  seed: "发酵",
  spread: "扩散",
  peak: "高峰",
  response: "回应",
  decline: "回落",
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr.replace(/-/g, "/"));
  const weekDays = ["日", "一", "二", "三", "四", "五", "六"];
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 星期${weekDays[d.getDay()]}`;
}

export default function ReportGenerator() {
  const {
    opinions,
    actions,
    sentimentTrend,
    timelineNodes,
    alertRules,
  } = useOpinionStore();

  const [version, setVersion] = useState<ReportVersion>("morning");
  const [copied, setCopied] = useState(false);

  const stats = useMemo(() => {
    const totalVolume = 28471;
    const negativeCount = opinions.filter((o) => o.sentiment === "negative").length;
    const neutralCount = opinions.filter((o) => o.sentiment === "neutral").length;
    const positiveCount = opinions.filter((o) => o.sentiment === "positive").length;
    const negativeRatio = Math.round(
      (negativeCount / opinions.length) * 100
    );

    const highRisk = actions.filter((a) => a.riskLevel === "high").length;
    const mediumRisk = actions.filter((a) => a.riskLevel === "medium").length;
    const lowRisk = actions.filter((a) => a.riskLevel === "low").length;

    const doneCount = actions.filter((a) => a.status === "done").length;
    const inProgressCount = actions.filter((a) => a.status === "in_progress").length;
    const pendingCount = actions.filter((a) => a.status === "pending").length;

    const deptSummary = (["pr", "legal", "cs", "qa"] as const).map((dept) => {
      const deptActions = actions.filter((a) => a.department === dept);
      const done = deptActions.filter((a) => a.status === "done").length;
      const inProgress = deptActions.filter((a) => a.status === "in_progress").length;
      const pending = deptActions.filter((a) => a.status === "pending").length;
      return {
        dept,
        total: deptActions.length,
        done,
        inProgress,
        pending,
      };
    });

    const topOpinions = [...opinions]
      .sort((a, b) => b.heat - a.heat)
      .slice(0, 5);

    const keyNodes = [...timelineNodes]
      .sort((a, b) => (b.importance === "high" ? 1 : 0) - (a.importance === "high" ? 1 : 0))
      .slice(0, 5);

    const triggeredAlerts = alertRules.filter((r) => r.enabled);

    let trend: "up" | "down" | "flat" = "flat";
    if (sentimentTrend.length >= 2) {
      const first = sentimentTrend[0].total;
      const last = sentimentTrend[sentimentTrend.length - 1].total;
      if (last > first * 1.1) trend = "up";
      else if (last < first * 0.9) trend = "down";
    }

    const nextPlans = generateNextPlans(actions);

    return {
      totalVolume,
      negativeCount,
      neutralCount,
      positiveCount,
      negativeRatio,
      highRisk,
      mediumRisk,
      lowRisk,
      doneCount,
      inProgressCount,
      pendingCount,
      deptSummary,
      topOpinions,
      keyNodes,
      triggeredAlerts,
      trend,
      nextPlans,
    };
  }, [opinions, actions, sentimentTrend, timelineNodes, alertRules]);

  function generateNextPlans(allActions: ActionRecord[]) {
    const plans: Array<{
      priority: "P0" | "P1" | "P2";
      content: string;
      owner: string;
      deadline: string;
    }> = [];

    const pendingHigh = allActions.filter(
      (a) => a.riskLevel === "high" && a.status !== "done"
    );
    pendingHigh.forEach((a) => {
      plans.push({
        priority: "P0",
        content: `[${DEPARTMENT_LABELS[a.department]}] ${a.title}`,
        owner: a.owner,
        deadline: a.deadline,
      });
    });

    const pendingMedium = allActions.filter(
      (a) => a.riskLevel === "medium" && a.status !== "done"
    );
    pendingMedium.slice(0, 3).forEach((a) => {
      plans.push({
        priority: "P1",
        content: `[${DEPARTMENT_LABELS[a.department]}] ${a.title}`,
        owner: a.owner,
        deadline: a.deadline,
      });
    });

    const doneActions = allActions.filter((a) => a.status === "done");
    if (doneActions.length < 3) {
      plans.push({
        priority: "P2",
        content: "[复盘] 梳理本次事件处置流程，形成SOP优化建议",
        owner: "张总监",
        deadline: "2026-06-22 18:00",
      });
    }

    return plans.sort((a, b) => {
      const order = { P0: 0, P1: 1, P2: 2 } as const;
      return order[a.priority] - order[b.priority];
    });
  }

  const morningReportText = useMemo(() => {
    const today = "2026-06-19";
    const lines: string[] = [];

    lines.push("=".repeat(50));
    lines.push(`【舆情晨会简报】${formatDate(today)}`);
    lines.push("=".repeat(50));
    lines.push("");

    lines.push("一、舆情整体态势");
    lines.push("─".repeat(40));
    lines.push(`  总声量：${stats.totalVolume.toLocaleString()} 条（环比 +12.3%）`);
    lines.push(`  负面占比：${stats.negativeRatio}%（环比 +8.2pct）`);
    lines.push(`  正面：${stats.positiveCount}条 | 中性：${stats.neutralCount}条 | 负面：${stats.negativeCount}条`);
    lines.push(`  趋势判断：${stats.trend === "up" ? "⚠️ 声量持续上升，需重点关注" : stats.trend === "down" ? "✅ 声量有所回落" : "➖ 态势平稳"}`);
    lines.push("");

    lines.push("二、关键传播节点（Top 5）");
    lines.push("─".repeat(40));
    stats.keyNodes.forEach((node, idx) => {
      lines.push(`  ${idx + 1}. [${NODE_TYPE_LABELS[node.type]}] ${node.time}`);
      lines.push(`     ${node.title}`);
      if (node.importance === "high") {
        lines.push(`     ⚠️ 重要性：高`);
      }
      lines.push("");
    });

    lines.push("三、已触发预警");
    lines.push("─".repeat(40));
    stats.triggeredAlerts.forEach((rule, idx) => {
      lines.push(`  ${idx + 1}. ${rule.name}：阈值 ${rule.threshold}${rule.unit}，${rule.description}`);
    });
    if (stats.triggeredAlerts.length === 0) {
      lines.push("  暂无触发预警");
    }
    lines.push("");

    lines.push("四、各部门处置进展");
    lines.push("─".repeat(40));
    stats.deptSummary.forEach((ds) => {
      const pct = ds.total > 0 ? Math.round((ds.done / ds.total) * 100) : 0;
      lines.push(
        `  ▸ ${DEPARTMENT_LABELS[ds.dept]}：完成 ${ds.done}/${ds.total}（${pct}%）| 进行中 ${ds.inProgress} | 待处理 ${ds.pending}`
      );
      const deptActions = actions.filter((a) => a.department === ds.dept && a.status !== "done");
      deptActions.slice(0, 2).forEach((act) => {
        lines.push(`    · ${act.title}【${STATUS_LABELS[act.status]}】- ${act.owner}`);
      });
      lines.push("");
    });

    lines.push("五、今日重点关注事项");
    lines.push("─".repeat(40));
    const focusItems = actions.filter((a) => a.riskLevel === "high" && a.status !== "done");
    focusItems.forEach((act, idx) => {
      lines.push(`  ${idx + 1}. ${act.title}`);
      lines.push(`     负责：${act.owner} | 截止：${act.deadline}`);
    });
    lines.push("");
    lines.push("=".repeat(50));

    return lines.join("\n");
  }, [stats, actions]);

  const leaderReportText = useMemo(() => {
    const today = "2026-06-19";
    const lines: string[] = [];

    lines.push("=".repeat(50));
    lines.push(`【舆情研判简报·领导汇报版】${formatDate(today)}`);
    lines.push("=".repeat(50));
    lines.push("");

    lines.push("一、风险等级总览");
    lines.push("─".repeat(40));
    const totalRisk = stats.highRisk + stats.mediumRisk + stats.lowRisk;
    lines.push(`  待处置事项总计：${totalRisk} 项`);
    lines.push(`  🔴 高风险：${stats.highRisk} 项（需立即决策）`);
    lines.push(`  🟠 中风险：${stats.mediumRisk} 项（持续跟踪）`);
    lines.push(`  🟢 低风险：${stats.lowRisk} 项（常规推进）`);
    lines.push("");

    lines.push("二、核心数据指标");
    lines.push("─".repeat(40));
    lines.push(`  · 总声量：${stats.totalVolume.toLocaleString()} 条`);
    lines.push(`    同比变化：+12.3% ${stats.trend === "up" ? "↑" : stats.trend === "down" ? "↓" : "→"}`);
    lines.push(`  · 负面占比：${stats.negativeRatio}%`);
    lines.push(`    同比变化：+8.2pct ↑`);
    lines.push(`  · 处置完成率：${
      stats.doneCount + stats.inProgressCount + stats.pendingCount > 0
        ? Math.round(
            (stats.doneCount /
              (stats.doneCount + stats.inProgressCount + stats.pendingCount)) *
              100
          )
        : 0
    }%`);
    lines.push("");
    lines.push("  📊 趋势结论：");
    if (stats.trend === "up") {
      lines.push("  舆情声量整体呈上升趋势，负面信息扩散较快，需加大处置力度。");
    } else if (stats.trend === "down") {
      lines.push("  舆情声量呈回落态势，官方回应措施初见成效，继续巩固正面引导。");
    } else {
      lines.push("  舆情整体处于平稳期，但风险隐患仍存，需保持警惕。");
    }
    lines.push("");

    lines.push("三、核心传播节点分析");
    lines.push("─".repeat(40));
    stats.keyNodes.slice(0, 4).forEach((node, idx) => {
      lines.push(`  ${idx + 1}. ${node.time} | ${NODE_TYPE_LABELS[node.type]}阶段`);
      lines.push(`     事件：${node.title}`);
      const topStep = node.propagationChain?.[node.propagationChain.length - 1];
      if (topStep) {
        lines.push(`     关键传播：${topStep.author}（${topStep.authorTitle}）· ${topStep.platform}`);
        if (topStep.heat && topStep.heat > 0) {
          lines.push(`     热度：${topStep.heat.toLocaleString()}`);
        }
      }
      lines.push("");
    });

    lines.push("四、已采取措施及效果评估");
    lines.push("─".repeat(40));
    const doneItems = actions.filter((a) => a.status === "done");
    if (doneItems.length > 0) {
      doneItems.forEach((act, idx) => {
        lines.push(`  ${idx + 1}. [${RISK_LABELS[act.riskLevel]}] ${act.title}`);
        lines.push(`     责任部门：${DEPARTMENT_LABELS[act.department]} | 负责人：${act.owner}`);
        if (act.updates.length > 0) {
          const result = act.updates[act.updates.length - 1].content;
          lines.push(`     执行结果：${result}`);
        }
        lines.push("");
      });
    } else {
      lines.push("  暂无已完成措施");
      lines.push("");
    }

    lines.push("五、下一步行动计划（按优先级）");
    lines.push("─".repeat(40));
    const priorityLabels: Record<string, { icon: string; color: string }> = {
      P0: { icon: "🔴", color: "紧急" },
      P1: { icon: "🟠", color: "重要" },
      P2: { icon: "🟢", color: "常规" },
    };
    stats.nextPlans.forEach((plan, idx) => {
      const label = priorityLabels[plan.priority];
      lines.push(
        `  ${idx + 1}. ${label.icon} [${plan.priority}-${label.color}] ${plan.content}`
      );
      lines.push(`     负责人：${plan.owner} | 截止：${plan.deadline}`);
    });
    lines.push("");
    lines.push("=".repeat(50));

    return lines.join("\n");
  }, [stats, actions]);

  const activeText = version === "morning" ? morningReportText : leaderReportText;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = activeText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const PRIORITY_COLORS: Record<string, string> = {
    P0: "bg-alert-red/15 text-alert-red border-alert-red/30",
    P1: "bg-alert-orange/15 text-alert-orange border-alert-orange/30",
    P2: "bg-alert-green/15 text-alert-green border-alert-green/30",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="glass-card overflow-hidden"
    >
      <div className="p-5 border-b border-navy-700/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-alert-blue/15 border border-alert-blue/30 flex items-center justify-center">
              <FileText className="w-5 h-5 text-alert-blue" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-navy-50">研判简报生成器</h2>
              <p className="text-sm text-navy-200/50">一键生成标准化简报，支持晨会汇报与领导决策</p>
            </div>
          </div>

          <div className="flex items-center p-1 bg-navy-800/80 rounded-lg border border-navy-700/50">
            <button
              onClick={() => setVersion("morning")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                version === "morning"
                  ? "bg-alert-orange/20 text-alert-orange border border-alert-orange/30"
                  : "text-navy-200/70 hover:text-white hover:bg-navy-700/50"
              )}
            >
              <Sun className="w-4 h-4" />
              <span>晨会版</span>
            </button>
            <button
              onClick={() => setVersion("leader")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                version === "leader"
                  ? "bg-alert-blue/20 text-alert-blue border border-alert-blue/30"
                  : "text-navy-200/70 hover:text-white hover:bg-navy-700/50"
              )}
            >
              <Briefcase className="w-4 h-4" />
              <span>领导汇报版</span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-5">
        {version === "morning" ? (
          <div className="space-y-5">
            <div className="flex items-center gap-3 text-navy-100">
              <Calendar className="w-4 h-4 text-navy-200/60" />
              <span className="font-medium">晨会简报 · {formatDate("2026-06-19")}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="rounded-lg bg-navy-900/60 border border-navy-700/40 p-3">
                <p className="text-xs text-navy-200/50 mb-1">总声量</p>
                <div className="flex items-end justify-between">
                  <p className="text-2xl font-serif font-bold text-navy-50 tabular-nums">
                    {stats.totalVolume.toLocaleString()}
                  </p>
                  <span className="flex items-center gap-0.5 text-xs text-alert-red bg-alert-red/10 px-1.5 py-0.5 rounded">
                    <TrendingUp className="w-3 h-3" />
                    +12.3%
                  </span>
                </div>
              </div>
              <div className="rounded-lg bg-navy-900/60 border border-navy-700/40 p-3">
                <p className="text-xs text-navy-200/50 mb-1">负面占比</p>
                <div className="flex items-end justify-between">
                  <p className="text-2xl font-serif font-bold text-alert-red tabular-nums">
                    {stats.negativeRatio}%
                  </p>
                  <span className="flex items-center gap-0.5 text-xs text-alert-red bg-alert-red/10 px-1.5 py-0.5 rounded">
                    <TrendingUp className="w-3 h-3" />
                    +8.2pct
                  </span>
                </div>
              </div>
              <div className="rounded-lg bg-navy-900/60 border border-navy-700/40 p-3">
                <p className="text-xs text-navy-200/50 mb-1">预警触发</p>
                <p className="text-2xl font-serif font-bold text-alert-orange tabular-nums">
                  {stats.triggeredAlerts.length}
                </p>
              </div>
              <div className="rounded-lg bg-navy-900/60 border border-navy-700/40 p-3">
                <p className="text-xs text-navy-200/50 mb-1">待处置事项</p>
                <p className="text-2xl font-serif font-bold text-navy-50 tabular-nums">
                  {stats.inProgressCount + stats.pendingCount}
                </p>
              </div>
            </div>

            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-navy-100 mb-3">
                <Flag className="w-4 h-4 text-alert-blue" />
                关键传播节点
              </h3>
              <div className="space-y-2">
                {stats.keyNodes.slice(0, 5).map((node, idx) => (
                  <div
                    key={node.id}
                    className={cn(
                      "rounded-lg p-3 border transition-all",
                      node.importance === "high"
                        ? "bg-alert-red/5 border-alert-red/30"
                        : "bg-navy-900/40 border-navy-700/40"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={cn(
                          "flex-shrink-0 w-6 h-6 rounded flex items-center justify-center text-xs font-bold",
                          node.importance === "high"
                            ? "bg-alert-red/20 text-alert-red"
                            : "bg-navy-600/50 text-navy-100"
                        )}
                      >
                        {idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-xs font-medium text-alert-blue">
                            [{NODE_TYPE_LABELS[node.type]}]
                          </span>
                          <span className="text-xs text-navy-200/50">{node.time}</span>
                          {node.importance === "high" && (
                            <span className="text-xs font-medium text-alert-red">
                              ⚠️ 高重要
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-navy-100 font-medium">{node.title}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-navy-100 mb-3">
                <ShieldCheck className="w-4 h-4 text-alert-green" />
                各部门处置进展
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {stats.deptSummary.map((ds) => {
                  const pct = ds.total > 0 ? Math.round((ds.done / ds.total) * 100) : 0;
                  return (
                    <div
                      key={ds.dept}
                      className="rounded-lg bg-navy-900/40 border border-navy-700/40 p-3"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-navy-100">
                          {DEPARTMENT_LABELS[ds.dept]}
                        </span>
                        <span className="text-xs text-navy-200/60">
                          完成 {ds.done}/{ds.total}
                        </span>
                      </div>
                      <div className="h-2 bg-navy-700/50 rounded-full overflow-hidden mb-2">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all",
                            pct >= 80
                              ? "bg-alert-green"
                              : pct >= 50
                              ? "bg-alert-blue"
                              : "bg-alert-orange"
                          )}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-navy-200/50">
                          进行中 <span className="text-alert-blue font-medium">{ds.inProgress}</span>
                        </span>
                        <span className="text-navy-200/50">
                          待处理 <span className="text-navy-100 font-medium">{ds.pending}</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-lg bg-alert-red/10 border border-alert-red/30 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-alert-red" />
                  <span className="text-sm text-alert-red font-medium">高风险</span>
                </div>
                <p className="text-3xl font-serif font-bold text-alert-red tabular-nums glow-text-red">
                  {stats.highRisk}
                </p>
                <p className="text-xs text-navy-200/50 mt-1">需立即决策</p>
              </div>
              <div className="rounded-lg bg-alert-orange/10 border border-alert-orange/30 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-4 h-4 text-alert-orange" />
                  <span className="text-sm text-alert-orange font-medium">中风险</span>
                </div>
                <p className="text-3xl font-serif font-bold text-alert-orange tabular-nums glow-text-orange">
                  {stats.mediumRisk}
                </p>
                <p className="text-xs text-navy-200/50 mt-1">持续跟踪</p>
              </div>
              <div className="rounded-lg bg-alert-green/10 border border-alert-green/30 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-4 h-4 text-alert-green" />
                  <span className="text-sm text-alert-green font-medium">低风险</span>
                </div>
                <p className="text-3xl font-serif font-bold text-alert-green tabular-nums glow-text-green">
                  {stats.lowRisk}
                </p>
                <p className="text-xs text-navy-200/50 mt-1">常规推进</p>
              </div>
            </div>

            <div className="rounded-lg bg-navy-900/40 border border-navy-700/40 p-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-navy-100 mb-3">
                <TrendingUp className="w-4 h-4 text-alert-blue" />
                核心数据与趋势结论
              </h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-navy-200/50 mb-1">总声量</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-serif font-bold text-navy-50 tabular-nums">
                      {stats.totalVolume.toLocaleString()}
                    </p>
                    <span className="text-xs text-alert-red flex items-center gap-0.5">
                      <TrendingUp className="w-3 h-3" />
                      +12.3%
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-navy-200/50 mb-1">负面占比</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-serif font-bold text-alert-red tabular-nums">
                      {stats.negativeRatio}%
                    </p>
                    <span className="text-xs text-alert-red flex items-center gap-0.5">
                      <TrendingUp className="w-3 h-3" />
                      +8.2pct
                    </span>
                  </div>
                </div>
              </div>
              <div className="rounded-md bg-navy-800/60 p-3 border-l-4 border-alert-orange">
                <p className="text-sm text-navy-100 leading-relaxed">
                  📊 <span className="font-semibold">趋势结论：</span>
                  舆情声量整体呈上升趋势，负面信息扩散较快。官方召回声明发布后，
                  公众关注度虽高，但质疑声音仍持续存在。建议加大正面信息投放力度，
                  同时配合监管调查结果进行权威信息发布。
                </p>
              </div>
            </div>

            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-navy-100 mb-3">
                <Flag className="w-4 h-4 text-alert-blue" />
                核心传播节点
              </h3>
              <div className="space-y-2">
                {stats.keyNodes.slice(0, 4).map((node) => {
                  const topStep = node.propagationChain?.[node.propagationChain.length - 1];
                  return (
                    <div
                      key={node.id}
                      className="rounded-lg bg-navy-900/40 border border-navy-700/40 p-3"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs px-2 py-0.5 rounded bg-alert-blue/15 text-alert-blue font-medium">
                              {NODE_TYPE_LABELS[node.type]}
                            </span>
                            <span className="text-xs text-navy-200/50">{node.time}</span>
                          </div>
                          <p className="text-sm text-navy-100 font-medium mt-1">{node.title}</p>
                        </div>
                      </div>
                      {topStep && (
                        <div className="flex items-center gap-2 text-xs text-navy-200/60 pl-6">
                          <ArrowRight className="w-3 h-3" />
                          <span>
                            关键渠道：<span className="text-navy-100">{topStep.author}</span>
                            （{topStep.authorTitle}）· {topStep.platform}
                            {topStep.heat && topStep.heat > 0 && (
                              <span className="text-alert-orange ml-2">
                                热度 {topStep.heat.toLocaleString()}
                              </span>
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-navy-100 mb-3">
                <Target className="w-4 h-4 text-alert-orange" />
                下一步行动计划
              </h3>
              <div className="space-y-2">
                {stats.nextPlans.map((plan, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg bg-navy-900/40 border border-navy-700/40 p-3 flex items-start gap-3"
                  >
                    <span
                      className={cn(
                        "flex-shrink-0 px-2 py-0.5 rounded text-xs font-bold border",
                        PRIORITY_COLORS[plan.priority]
                      )}
                    >
                      {plan.priority}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-navy-100 font-medium">{plan.content}</p>
                      <div className="flex items-center gap-4 text-xs text-navy-200/50 mt-1">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {plan.owner}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {plan.deadline}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-5 border-t border-navy-700/40 bg-navy-800/30">
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs text-navy-200/40">
            简报已根据当前数据自动生成，点击按钮复制纯文本内容
          </p>
          <button
            onClick={handleCopy}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all",
              copied
                ? "bg-alert-green/20 text-alert-green border border-alert-green/30"
                : "bg-alert-blue hover:bg-alert-blue/90 text-white shadow-glow"
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
                <span>复制纯文本</span>
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
