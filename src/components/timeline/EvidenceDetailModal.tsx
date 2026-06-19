import { useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  User,
  Clock,
  Flame,
  Share2,
  Link2,
  ArrowRight,
  ArrowUpDown,
  ClipboardCheck,
  Calendar,
  Info,
  AlertTriangle,
  Newspaper,
  Megaphone,
  ShieldCheck,
} from "lucide-react";
import { useOpinionStore } from "@/store/useOpinionStore";
import { cn } from "@/lib/utils";
import type { ActionRecord, PropagationStep } from "@/types";

interface EvidenceDetailModalProps {
  open: boolean;
  onClose: () => void;
  evidence: {
    source: string;
    author: string;
    authorTitle?: string;
    summary: string;
    content?: string;
    time: string;
    heat?: number;
    platform?: string;
    phase: string;
    opinionId?: string;
    relatedOpinionIds?: string[];
    nodeId?: string;
  } | null;
}

interface PhaseConfig {
  key: string;
  label: string;
  icon: typeof Flame;
  color: string;
  rationale: string;
}

const PHASES: PhaseConfig[] = [
  {
    key: "complaint",
    label: "投诉爆发",
    icon: AlertTriangle,
    color: "#FF4D4F",
    rationale: "有明确的消费者投诉内容，涉及产品质量问题或用户负面体验，属于舆情种子阶段。此类信息通常最早出现，是危机的源头信号。",
  },
  {
    key: "kols_forward",
    label: "大号转发",
    icon: Flame,
    color: "#FA8C16",
    rationale: "被具有影响力的 KOL、博主、资讯账号等转发或发布，传播范围开始扩大，影响力显著提升。此阶段舆情开始从局部向广泛扩散。",
  },
  {
    key: "media_cite",
    label: "媒体引用",
    icon: Newspaper,
    color: "#722ED1",
    rationale: "被正规媒体机构报道或引用，舆情进入公众视野，可能产生更广泛的社会影响。媒体报道往往标志着舆情升级到新的级别。",
  },
  {
    key: "official",
    label: "官方回应",
    icon: Megaphone,
    color: "#52C41A",
    rationale: "企业或官方机构发布正式声明、回应或采取措施处理危机。此阶段通常是舆情转折点，官方态度和行动直接影响后续走向。",
  },
];

const STEP_TYPE_PHASE_MAP: Record<PropagationStep["stepType"], string> = {
  complaint: "complaint",
  kols_forward: "kols_forward",
  media_cite: "media_cite",
  official: "official",
  rumor: "kols_forward",
};

const STATUS_MAP: Record<ActionRecord["status"], { label: string; className: string }> = {
  pending: { label: "待处理", className: "bg-navy-600/40 text-navy-200/60" },
  in_progress: { label: "进行中", className: "bg-alert-orange/20 text-alert-orange" },
  done: { label: "已完成", className: "bg-alert-green/20 text-alert-green" },
};

const RISK_MAP: Record<ActionRecord["riskLevel"], { label: string; color: string; bg: string }> = {
  high: { label: "高风险", color: "text-alert-red", bg: "bg-alert-red/15" },
  medium: { label: "中风险", color: "text-alert-orange", bg: "bg-alert-orange/15" },
  low: { label: "低风险", color: "text-alert-green", bg: "bg-alert-green/15" },
};

function formatHeat(heat: number): string {
  if (heat >= 10000) {
    return `${(heat / 10000).toFixed(1)}万`;
  }
  return heat.toLocaleString();
}

export default function EvidenceDetailModal({ open, onClose, evidence }: EvidenceDetailModalProps) {
  const { timelineNodes, opinions, actions } = useOpinionStore();

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  const phaseConfig = useMemo(() => {
    return PHASES.find((p) => p.key === evidence?.phase) ?? PHASES[0];
  }, [evidence]);

  const propagationChain = useMemo(() => {
    if (!evidence) return { upstream: [] as PropagationStep[], current: null as PropagationStep | null, downstream: [] as PropagationStep[] };

    const allSteps: (PropagationStep & { nodeTime: string })[] = [];
    timelineNodes.forEach((node) => {
      if (node.propagationChain) {
        node.propagationChain.forEach((step) => {
          allSteps.push({ ...step, nodeTime: node.time });
        });
      }
    });

    allSteps.sort((a, b) => a.publishTime.localeCompare(b.publishTime));

    const currentIndex = allSteps.findIndex(
      (step) =>
        step.author === evidence.author &&
        (step.content === evidence.summary || step.content === evidence.content) &&
        step.publishTime === evidence.time
    );

    if (currentIndex === -1) {
      return { upstream: allSteps, current: null, downstream: [] };
    }

    return {
      upstream: allSteps.slice(0, currentIndex),
      current: allSteps[currentIndex],
      downstream: allSteps.slice(currentIndex + 1),
    };
  }, [evidence, timelineNodes]);

  const relatedActions = useMemo(() => {
    if (!evidence) return [];

    const targetIds = new Set<string>();
    if (evidence.opinionId) targetIds.add(evidence.opinionId);
    if (evidence.relatedOpinionIds) {
      evidence.relatedOpinionIds.forEach((id) => targetIds.add(id));
    }

    if (evidence.summary) {
      opinions.forEach((op) => {
        if (op.summary === evidence.summary || op.author === evidence.author) {
          targetIds.add(op.id);
        }
      });
    }

    if (evidence.nodeId) {
      const node = timelineNodes.find((n) => n.id === evidence.nodeId);
      if (node) {
        node.opinionIds.forEach((id) => targetIds.add(id));
      }
    }

    const actionIds = new Set<string>();
    const result: ActionRecord[] = [];

    actions.forEach((action) => {
      const hasMatch = action.relatedOpinionIds.some((id) => targetIds.has(id));
      if (hasMatch && !actionIds.has(action.id)) {
        actionIds.add(action.id);
        result.push(action);
      }
    });

    return result;
  }, [evidence, actions, opinions, timelineNodes]);

  const PhaseIcon = phaseConfig.icon;

  if (!evidence) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-navy-950/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-4 md:inset-x-8 lg:inset-x-auto lg:left-1/2 lg:-translate-x-1/2 top-16 bottom-4 md:top-20 md:bottom-8 lg:w-[900px] xl:w-[1000px] z-50 flex flex-col"
          >
            <div className="flex-1 glass-card flex flex-col overflow-hidden border-navy-600/40">
              <div
                className="relative px-6 py-5 border-b border-navy-700/50"
                style={{
                  background: `linear-gradient(135deg, ${phaseConfig.color}10 0%, transparent 50%)`,
                }}
              >
                <div
                  className="absolute -top-px left-0 right-0 h-0.5"
                  style={{
                    background: `linear-gradient(90deg, ${phaseConfig.color}, ${phaseConfig.color}40, transparent)`,
                  }}
                />
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${phaseConfig.color}15` }}
                  >
                    <PhaseIcon className="w-6 h-6" style={{ color: phaseConfig.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-xs px-2.5 py-1 rounded-md font-medium"
                        style={{ backgroundColor: `${phaseConfig.color}15`, color: phaseConfig.color }}
                      >
                        {phaseConfig.label} · {evidence.source}
                      </span>
                      {evidence.heat !== undefined && evidence.heat > 0 && (
                        <span className="flex items-center gap-1 text-xs text-alert-orange">
                          <Flame className="w-3.5 h-3.5" />
                          <span className="font-medium tabular-nums">{formatHeat(evidence.heat)}</span>
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl font-serif font-bold text-navy-50 leading-snug">
                      {evidence.summary.slice(0, 50)}{evidence.summary.length > 50 ? "..." : ""}
                    </h2>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-navy-200/50 hover:text-navy-100 hover:bg-navy-700/50 transition-all duration-200 flex-shrink-0"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="p-6 space-y-6">
                  <section>
                    <div className="flex items-center gap-2 mb-4">
                      <div
                        className="w-0.5 h-5 rounded-full"
                        style={{ backgroundColor: phaseConfig.color }}
                      />
                      <h3 className="text-base font-semibold text-navy-50">原始舆情</h3>
                    </div>
                    <div className="rounded-xl border border-navy-600/30 bg-navy-800/30 p-5">
                      <div className="flex flex-wrap items-center gap-4 mb-4 pb-4 border-b border-navy-700/30">
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 rounded-full bg-navy-700/50 flex items-center justify-center">
                            <User className="w-4 h-4 text-navy-200/70" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-navy-100">{evidence.author}</div>
                            {evidence.authorTitle && (
                              <div className="text-xs text-navy-200/50">{evidence.authorTitle}</div>
                            )}
                          </div>
                        </div>
                        {evidence.platform && (
                          <div className="flex items-center gap-1.5 text-xs text-navy-200/60">
                            <Share2 className="w-3.5 h-3.5" />
                            <span>{evidence.platform}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 text-xs text-navy-200/60">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{evidence.time}</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <p className="text-sm text-navy-200/80 leading-relaxed whitespace-pre-wrap">
                          {evidence.summary}
                        </p>
                        {evidence.content && evidence.content !== evidence.summary && (
                          <p className="text-sm text-navy-200/60 leading-relaxed whitespace-pre-wrap pt-2 border-t border-navy-700/20">
                            {evidence.content}
                          </p>
                        )}
                      </div>
                      <div className="mt-4 pt-4 border-t border-navy-700/30 flex items-center gap-3">
                        <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-navy-200/60 bg-navy-700/40 hover:bg-navy-600/50 hover:text-navy-100 transition-all duration-200 border border-navy-600/30">
                          <Link2 className="w-3.5 h-3.5" />
                          <span>查看原文</span>
                        </button>
                        <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-navy-200/60 bg-navy-700/40 hover:bg-navy-600/50 hover:text-navy-100 transition-all duration-200 border border-navy-600/30">
                          <Share2 className="w-3.5 h-3.5" />
                          <span>分享</span>
                        </button>
                      </div>
                    </div>
                  </section>

                  <section>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-0.5 h-5 rounded-full bg-alert-blue" />
                      <h3 className="text-base font-semibold text-navy-50">传播链路</h3>
                      <div className="flex items-center gap-1 text-xs text-navy-200/40">
                        <ArrowUpDown className="w-3.5 h-3.5" />
                        <span>按时间顺序</span>
                      </div>
                    </div>
                    <div className="rounded-xl border border-navy-600/30 bg-navy-800/30 p-5">
                      {(propagationChain.upstream.length > 0 || propagationChain.current || propagationChain.downstream.length > 0) ? (
                        <div className="space-y-3">
                          {propagationChain.upstream.length > 0 && (
                            <div className="space-y-3">
                              {propagationChain.upstream.map((step, idx) => {
                                const stepPhase = PHASES.find(
                                  (p) => p.key === STEP_TYPE_PHASE_MAP[step.stepType]
                                ) ?? PHASES[0];
                                return (
                                  <div key={`up-${idx}`} className="relative pl-8">
                                    {idx < propagationChain.upstream.length - 1 && (
                                      <div className="absolute left-2.5 top-8 bottom-0 w-px bg-navy-600/40" />
                                    )}
                                    <div className="absolute left-0 top-1.5 w-5 h-5 rounded-full border-2 border-navy-600/50 bg-navy-800 flex items-center justify-center">
                                      <div className="w-1.5 h-1.5 rounded-full bg-navy-500/60" />
                                    </div>
                                    <div className="rounded-lg border border-navy-600/20 bg-navy-700/20 p-3">
                                      <div className="flex items-center gap-2 mb-1.5">
                                        <span
                                          className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                                          style={{
                                            backgroundColor: `${stepPhase.color}15`,
                                            color: stepPhase.color,
                                          }}
                                        >
                                          {stepPhase.label}
                                        </span>
                                        <span className="text-xs text-navy-200/40">{step.platform}</span>
                                      </div>
                                      <div className="flex items-center gap-2 mb-1.5">
                                        <span className="text-xs font-medium text-navy-200/80">
                                          {step.author}
                                        </span>
                                        {step.authorTitle && (
                                          <span className="text-xs text-navy-200/40">
                                            · {step.authorTitle}
                                          </span>
                                        )}
                                        <span className="text-xs text-navy-200/40 ml-auto">
                                          {step.publishTime}
                                        </span>
                                      </div>
                                      <p className="text-xs text-navy-200/50 line-clamp-2 leading-relaxed">
                                        {step.content}
                                      </p>
                                      {step.heat !== undefined && step.heat > 0 && (
                                        <div className="flex items-center gap-1 mt-2 text-[10px] text-alert-orange/70">
                                          <Flame className="w-3 h-3" />
                                          <span className="tabular-nums">{formatHeat(step.heat)}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {propagationChain.current && (
                            <div className="relative pl-8">
                              <div
                                className="absolute left-2.5 top-0 bottom-0 w-px"
                                style={{ backgroundColor: `${phaseConfig.color}40` }}
                              />
                              <div
                                className="absolute left-0 top-1.5 w-6 h-6 rounded-full flex items-center justify-center shadow-lg"
                                style={{
                                  backgroundColor: phaseConfig.color,
                                  boxShadow: `0 0 0 4px ${phaseConfig.color}20`,
                                }}
                              >
                                <ArrowRight className="w-3 h-3 text-white" />
                              </div>
                              <div
                                className="rounded-lg border-2 p-4"
                                style={{
                                  borderColor: `${phaseConfig.color}40`,
                                  backgroundColor: `${phaseConfig.color}08`,
                                }}
                              >
                                <div className="flex items-center gap-2 mb-2">
                                  <span
                                    className="text-[10px] px-2 py-0.5 rounded font-medium"
                                    style={{
                                      backgroundColor: `${phaseConfig.color}20`,
                                      color: phaseConfig.color,
                                    }}
                                  >
                                    当前证据
                                  </span>
                                  <span className="text-xs text-navy-200/40">
                                    {propagationChain.current.platform}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-sm font-medium text-navy-100">
                                    {propagationChain.current.author}
                                  </span>
                                  {propagationChain.current.authorTitle && (
                                    <span className="text-xs text-navy-200/50">
                                      · {propagationChain.current.authorTitle}
                                    </span>
                                  )}
                                  <span className="text-xs text-navy-200/40 ml-auto">
                                    {propagationChain.current.publishTime}
                                  </span>
                                </div>
                                <p className="text-sm text-navy-200/70 leading-relaxed">
                                  {propagationChain.current.content}
                                </p>
                                {propagationChain.current.heat !== undefined &&
                                  propagationChain.current.heat > 0 && (
                                    <div className="flex items-center gap-1 mt-2 text-xs text-alert-orange">
                                      <Flame className="w-3.5 h-3.5" />
                                      <span className="font-medium tabular-nums">
                                        {formatHeat(propagationChain.current.heat)}
                                      </span>
                                    </div>
                                  )}
                              </div>
                            </div>
                          )}

                          {!propagationChain.current && evidence && (
                            <div className="relative pl-8">
                              <div
                                className="absolute left-2.5 top-0 bottom-0 w-px"
                                style={{ backgroundColor: `${phaseConfig.color}40` }}
                              />
                              <div
                                className="absolute left-0 top-1.5 w-6 h-6 rounded-full flex items-center justify-center shadow-lg"
                                style={{
                                  backgroundColor: phaseConfig.color,
                                  boxShadow: `0 0 0 4px ${phaseConfig.color}20`,
                                }}
                              >
                                <ArrowRight className="w-3 h-3 text-white" />
                              </div>
                              <div
                                className="rounded-lg border-2 p-4"
                                style={{
                                  borderColor: `${phaseConfig.color}40`,
                                  backgroundColor: `${phaseConfig.color}08`,
                                }}
                              >
                                <div className="flex items-center gap-2 mb-2">
                                  <span
                                    className="text-[10px] px-2 py-0.5 rounded font-medium"
                                    style={{
                                      backgroundColor: `${phaseConfig.color}20`,
                                      color: phaseConfig.color,
                                    }}
                                  >
                                    当前证据
                                  </span>
                                  {evidence.platform && (
                                    <span className="text-xs text-navy-200/40">{evidence.platform}</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-sm font-medium text-navy-100">{evidence.author}</span>
                                  {evidence.authorTitle && (
                                    <span className="text-xs text-navy-200/50">
                                      · {evidence.authorTitle}
                                    </span>
                                  )}
                                  <span className="text-xs text-navy-200/40 ml-auto">{evidence.time}</span>
                                </div>
                                <p className="text-sm text-navy-200/70 leading-relaxed">
                                  {evidence.summary}
                                </p>
                              </div>
                            </div>
                          )}

                          {propagationChain.downstream.length > 0 && (
                            <div className="space-y-3 pt-1">
                              {propagationChain.downstream.map((step, idx) => {
                                const stepPhase = PHASES.find(
                                  (p) => p.key === STEP_TYPE_PHASE_MAP[step.stepType]
                                ) ?? PHASES[0];
                                return (
                                  <div key={`down-${idx}`} className="relative pl-8">
                                    <div className="absolute left-2.5 top-0 bottom-0 w-px bg-navy-600/40" />
                                    <div className="absolute left-0 top-1.5 w-5 h-5 rounded-full border-2 border-navy-600/50 bg-navy-800 flex items-center justify-center">
                                      <div className="w-1.5 h-1.5 rounded-full bg-navy-500/60" />
                                    </div>
                                    <div className="rounded-lg border border-navy-600/20 bg-navy-700/20 p-3">
                                      <div className="flex items-center gap-2 mb-1.5">
                                        <span
                                          className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                                          style={{
                                            backgroundColor: `${stepPhase.color}15`,
                                            color: stepPhase.color,
                                          }}
                                        >
                                          {stepPhase.label}
                                        </span>
                                        <span className="text-xs text-navy-200/40">{step.platform}</span>
                                      </div>
                                      <div className="flex items-center gap-2 mb-1.5">
                                        <span className="text-xs font-medium text-navy-200/80">
                                          {step.author}
                                        </span>
                                        {step.authorTitle && (
                                          <span className="text-xs text-navy-200/40">
                                            · {step.authorTitle}
                                          </span>
                                        )}
                                        <span className="text-xs text-navy-200/40 ml-auto">
                                          {step.publishTime}
                                        </span>
                                      </div>
                                      <p className="text-xs text-navy-200/50 line-clamp-2 leading-relaxed">
                                        {step.content}
                                      </p>
                                      {step.heat !== undefined && step.heat > 0 && (
                                        <div className="flex items-center gap-1 mt-2 text-[10px] text-alert-orange/70">
                                          <Flame className="w-3 h-3" />
                                          <span className="tabular-nums">{formatHeat(step.heat)}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-navy-200/40 text-sm">
                          <ArrowUpDown className="w-8 h-8 mx-auto mb-2 opacity-40" />
                          <p>暂无完整传播链数据</p>
                        </div>
                      )}
                    </div>
                  </section>

                  <section>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-0.5 h-5 rounded-full bg-alert-green" />
                      <h3 className="text-base font-semibold text-navy-50">处置进展</h3>
                      <div className="text-xs text-navy-200/40">
                        {relatedActions.length > 0
                          ? `${relatedActions.length} 条相关处置`
                          : "暂无关联处置"}
                      </div>
                    </div>
                    <div className="space-y-3">
                      {relatedActions.length > 0 ? (
                        relatedActions.map((action) => {
                          const statusInfo = STATUS_MAP[action.status];
                          const riskInfo = RISK_MAP[action.riskLevel];
                          const latestUpdate =
                            action.updates.length > 0
                              ? action.updates[action.updates.length - 1]
                              : null;
                          return (
                            <div
                              key={action.id}
                              className="rounded-xl border border-navy-600/30 bg-navy-800/30 p-4 hover:border-navy-500/40 transition-all duration-200"
                            >
                              <div className="flex items-start gap-3 mb-3">
                                <div className="w-9 h-9 rounded-lg bg-alert-blue/15 flex items-center justify-center flex-shrink-0">
                                  <ClipboardCheck className="w-4 h-4 text-alert-blue" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className="text-sm font-semibold text-navy-100 truncate">
                                      {action.title}
                                    </h4>
                                  </div>
                                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                    <span
                                      className={cn(
                                        "text-[10px] px-2 py-0.5 rounded font-medium",
                                        statusInfo.className
                                      )}
                                    >
                                      {statusInfo.label}
                                    </span>
                                    <span
                                      className={cn(
                                        "text-[10px] px-2 py-0.5 rounded font-medium",
                                        riskInfo.bg,
                                        riskInfo.color
                                      )}
                                    >
                                      {riskInfo.label}
                                    </span>
                                    <div className="flex items-center gap-1 text-[10px] text-navy-200/50">
                                      <User className="w-3 h-3" />
                                      <span>{action.owner}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-[10px] text-navy-200/50">
                                      <Calendar className="w-3 h-3" />
                                      <span>截止 {action.deadline}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              {latestUpdate && (
                                <div className="ml-12 pl-3 border-l border-navy-600/30">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] text-navy-200/40">
                                      {latestUpdate.operator}
                                    </span>
                                    <span className="text-[10px] text-navy-200/30">
                                      {latestUpdate.time}
                                    </span>
                                  </div>
                                  <p className="text-xs text-navy-200/60 leading-relaxed">
                                    {latestUpdate.content}
                                  </p>
                                </div>
                              )}
                              {!latestUpdate && (
                                <div className="ml-12 pl-3 border-l border-navy-600/30">
                                  <p className="text-xs text-navy-200/30 italic">暂无进展更新</p>
                                </div>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <div className="rounded-xl border border-navy-600/20 bg-navy-800/20 p-8 text-center">
                          <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-navy-500/40" />
                          <p className="text-sm text-navy-200/40">该证据暂无关联的处置记录</p>
                        </div>
                      )}
                    </div>
                  </section>

                  <section>
                    <div className="flex items-center gap-2 mb-4">
                      <div
                        className="w-0.5 h-5 rounded-full"
                        style={{ backgroundColor: phaseConfig.color }}
                      />
                      <h3 className="text-base font-semibold text-navy-50">
                        为什么属于【{phaseConfig.label}】
                      </h3>
                    </div>
                    <div
                      className="rounded-xl border p-5"
                      style={{
                        borderColor: `${phaseConfig.color}25`,
                        backgroundColor: `${phaseConfig.color}05`,
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${phaseConfig.color}15` }}
                        >
                          <Info
                            className="w-4 h-4"
                            style={{ color: phaseConfig.color }}
                          />
                        </div>
                        <div>
                          <h4
                            className="text-sm font-medium mb-2"
                            style={{ color: phaseConfig.color }}
                          >
                            阶段判断依据
                          </h4>
                          <p className="text-sm text-navy-200/70 leading-relaxed">
                            {phaseConfig.rationale}
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
