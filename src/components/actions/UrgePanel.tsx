import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  X,
  BellRing,
  Clock,
  Copy,
  Check,
  Megaphone,
  Scale,
  Headphones,
  Microscope,
  AlertTriangle,
} from "lucide-react";
import type { ActionRecord } from "@/types";
import { cn } from "@/lib/utils";

interface UrgePanelProps {
  actions: ActionRecord[];
  onClose: () => void;
}

interface DepartmentConfig {
  key: ActionRecord["department"];
  label: string;
  icon: typeof Megaphone;
  color: string;
  suggestions: string[];
}

const DEPARTMENTS: DepartmentConfig[] = [
  {
    key: "pr",
    label: "公关部",
    icon: Megaphone,
    color: "#1890FF",
    suggestions: ["尽快联系重点媒体沟通", "发布官方声明", "持续监测舆情走向"],
  },
  {
    key: "legal",
    label: "法务部",
    icon: Scale,
    color: "#722ED1",
    suggestions: ["完成法律风险评估", "准备律师函", "审核声明文案"],
  },
  {
    key: "cs",
    label: "客服部",
    icon: Headphones,
    color: "#13C2C2",
    suggestions: ["统一客服口径", "培训一线客服", "整理投诉记录"],
  },
  {
    key: "qa",
    label: "质量部",
    icon: Microscope,
    color: "#52C41A",
    suggestions: ["完成产品检测", "溯源调查", "出具质量报告"],
  },
];

const RISK_LABELS: Record<ActionRecord["riskLevel"], string> = {
  high: "高风险",
  medium: "中风险",
  low: "低风险",
};

function isStuck(action: ActionRecord): boolean {
  if (action.status === "done") return false;
  if (action.updates.length === 0) return true;

  const lastUpdate = action.updates[action.updates.length - 1];
  const lastUpdateTime = new Date(lastUpdate.time.replace(" ", "T"));
  const now = new Date();
  const diffMs = now.getTime() - lastUpdateTime.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  return diffHours > 24;
}

function formatLastUpdate(action: ActionRecord): string {
  if (action.updates.length === 0) return "从未更新";
  const lastUpdate = action.updates[action.updates.length - 1];
  return `${lastUpdate.time} / ${lastUpdate.operator}`;
}

function getSuggestion(action: ActionRecord, deptConfig: DepartmentConfig): string {
  const index = action.updates.length % deptConfig.suggestions.length;
  return deptConfig.suggestions[index];
}

function generateUrgeText(
  deptConfig: DepartmentConfig,
  stuckActions: ActionRecord[]
): string {
  const lines: string[] = [];
  lines.push("【舆情处置催办】");
  lines.push("");
  lines.push(`${deptConfig.label}的同事你好，以下舆情处置任务已超过24小时未更新，请尽快跟进：`);
  lines.push("");

  stuckActions.forEach((action, index) => {
    lines.push(`${index + 1}. ${action.title}（${RISK_LABELS[action.riskLevel]}）`);
    lines.push(`   最后更新：${formatLastUpdate(action)}`);
    lines.push(`   建议下一步：${getSuggestion(action, deptConfig)}`);
    lines.push("");
  });

  lines.push("请在今日内更新进展，谢谢配合！");
  lines.push("—— 公关指挥台");

  return lines.join("\n");
}

export default function UrgePanel({ actions, onClose }: UrgePanelProps) {
  const [copiedDept, setCopiedDept] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const stuckByDept = useMemo(() => {
    const result = new Map<ActionRecord["department"], ActionRecord[]>();
    DEPARTMENTS.forEach((d) => result.set(d.key, []));

    actions.forEach((action) => {
      if (isStuck(action)) {
        const list = result.get(action.department);
        if (list) {
          list.push(action);
        }
      }
    });

    return result;
  }, [actions]);

  const totalStuck = useMemo(() => {
    let count = 0;
    stuckByDept.forEach((list) => {
      count += list.length;
    });
    return count;
  }, [stuckByDept]);

  const handleCopyDept = async (deptKey: ActionRecord["department"]) => {
    const deptConfig = DEPARTMENTS.find((d) => d.key === deptKey);
    const stuckActions = stuckByDept.get(deptKey) || [];
    if (!deptConfig || stuckActions.length === 0) return;

    const text = generateUrgeText(deptConfig, stuckActions);
    try {
      await navigator.clipboard.writeText(text);
      setCopiedDept(deptKey);
      setTimeout(() => setCopiedDept(null), 2000);
    } catch {
      // ignore
    }
  };

  const handleCopyAll = async () => {
    const parts: string[] = [];
    DEPARTMENTS.forEach((dept) => {
      const stuckActions = stuckByDept.get(dept.key) || [];
      if (stuckActions.length > 0) {
        parts.push(generateUrgeText(dept, stuckActions));
      }
    });

    const text = parts.join("\n\n——————————\n\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex justify-end"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-navy-950/70 backdrop-blur-sm"
      />
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="relative w-full max-w-md h-full glass-card border-l border-navy-600/40 flex flex-col"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-navy-700/50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-alert-orange/15 flex items-center justify-center">
              <BellRing className="w-5 h-5 text-alert-orange" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-navy-50">协同催办</h2>
              <p className="text-xs text-navy-200/50">
                {totalStuck > 0 ? `${totalStuck} 项任务待跟进` : "暂无卡点任务"}
              </p>
            </div>
          </div>
          {totalStuck > 0 && (
            <span className="px-2.5 py-1 rounded-full bg-alert-red/20 text-alert-red text-xs font-medium">
              {totalStuck}
            </span>
          )}
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-navy-200/60 hover:text-white hover:bg-navy-700/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-5">
          {totalStuck > 0 ? (
            <>
              <button
                onClick={handleCopyAll}
                className={cn(
                  "w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-sm transition-all",
                  copiedAll
                    ? "bg-alert-green/20 text-alert-green border border-alert-green/40"
                    : "bg-alert-blue hover:bg-alert-blue/90 text-white shadow-glow"
                )}
              >
                {copiedAll ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>已复制全部催办话术</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>一键复制全部催办话术</span>
                  </>
                )}
              </button>

              {DEPARTMENTS.map((dept) => {
                const stuckActions = stuckByDept.get(dept.key) || [];
                if (stuckActions.length === 0) return null;

                const DeptIcon = dept.icon;
                const isCopied = copiedDept === dept.key;

                return (
                  <div
                    key={dept.key}
                    className="rounded-xl border border-navy-600/30 bg-navy-800/30 overflow-hidden"
                  >
                    <div
                      className="flex items-center gap-3 px-4 py-3 border-b border-navy-700/40"
                      style={{
                        background: `linear-gradient(90deg, ${dept.color}10 0%, transparent 100%)`,
                      }}
                    >
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${dept.color}15` }}
                      >
                        <DeptIcon className="w-4.5 h-4.5" style={{ color: dept.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-navy-100">{dept.label}</h3>
                        <p className="text-xs text-navy-200/50">
                          {stuckActions.length} 项卡点任务
                        </p>
                      </div>
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: `${dept.color}15`,
                          color: dept.color,
                        }}
                      >
                        {stuckActions.length}
                      </span>
                    </div>

                    <div className="p-4 space-y-3">
                      {stuckActions.map((action) => (
                        <div
                          key={action.id}
                          className="rounded-lg border border-navy-600/20 bg-navy-700/20 p-3"
                        >
                          <div className="flex items-start gap-2 mb-2">
                            <AlertTriangle className="w-4 h-4 text-alert-orange flex-shrink-0 mt-0.5" />
                            <h4 className="text-sm font-medium text-navy-100 leading-snug">
                              {action.title}
                            </h4>
                          </div>
                          <div className="ml-6 space-y-2">
                            <div className="flex items-center gap-1.5 text-xs text-navy-200/50">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{formatLastUpdate(action)}</span>
                            </div>
                            <div className="flex items-start gap-1.5 text-xs">
                              <span
                                className="px-1.5 py-0.5 rounded text-[10px] font-medium flex-shrink-0"
                                style={{
                                  backgroundColor:
                                    action.riskLevel === "high"
                                      ? "rgba(255, 77, 79, 0.15)"
                                      : action.riskLevel === "medium"
                                      ? "rgba(250, 140, 22, 0.15)"
                                      : "rgba(82, 196, 26, 0.15)",
                                  color:
                                    action.riskLevel === "high"
                                      ? "#FF4D4F"
                                      : action.riskLevel === "medium"
                                      ? "#FA8C16"
                                      : "#52C41A",
                                }}
                              >
                                {RISK_LABELS[action.riskLevel]}
                              </span>
                              <span className="text-navy-200/60 leading-relaxed">
                                建议：{getSuggestion(action, dept)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}

                      <button
                        onClick={() => handleCopyDept(dept.key)}
                        className={cn(
                          "w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all",
                          isCopied
                            ? "bg-alert-green/20 text-alert-green border border-alert-green/30"
                            : "bg-navy-700/40 text-navy-200/70 hover:bg-navy-600/50 hover:text-navy-100 border border-navy-600/30"
                        )}
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>已复制催办话术</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>复制部门催办话术</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-alert-green/10 flex items-center justify-center mb-4">
                <Check className="w-8 h-8 text-alert-green" />
              </div>
              <h3 className="text-base font-semibold text-navy-100 mb-1">
                暂无卡点任务
              </h3>
              <p className="text-sm text-navy-200/50">
                所有处置任务都在按时推进中
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
