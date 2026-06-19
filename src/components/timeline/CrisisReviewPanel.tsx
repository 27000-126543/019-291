import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  ClipboardCheck,
  User,
  Flame,
  Newspaper,
  Megaphone,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { useOpinionStore } from "@/store/useOpinionStore";
import { cn } from "@/lib/utils";
import type { PropagationStep, ActionRecord } from "@/types";
import EvidenceDetailModal from "./EvidenceDetailModal";

interface PhaseConfig {
  key: string;
  label: string;
  icon: typeof Flame;
  color: string;
}

const PHASES: PhaseConfig[] = [
  { key: "complaint", label: "投诉爆发", icon: AlertTriangle, color: "#FF4D4F" },
  { key: "kols_forward", label: "大号转发", icon: Flame, color: "#FA8C16" },
  { key: "media_cite", label: "媒体引用", icon: Newspaper, color: "#722ED1" },
  { key: "official", label: "官方回应", icon: Megaphone, color: "#52C41A" },
];

interface EvidenceItem {
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
}

interface ActionItem {
  title: string;
  status: ActionRecord["status"];
  owner: string;
}

const STATUS_MAP: Record<ActionRecord["status"], { label: string; className: string }> = {
  pending: { label: "待处理", className: "bg-navy-600/40 text-navy-200/60" },
  in_progress: { label: "进行中", className: "bg-alert-orange/20 text-alert-orange" },
  done: { label: "已完成", className: "bg-alert-green/20 text-alert-green" },
};

function ActionCard({ action }: { action: ActionItem }) {
  const statusInfo = STATUS_MAP[action.status];
  return (
    <div className="rounded-lg bg-navy-700/30 border border-navy-600/30 p-3 flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-alert-blue/15 flex items-center justify-center flex-shrink-0">
        <ClipboardCheck className="w-4 h-4 text-alert-blue" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-navy-100 truncate">{action.title}</div>
        <div className="flex items-center gap-2 mt-1">
          <span className={cn("text-xs px-2 py-0.5 rounded", statusInfo.className)}>
            {statusInfo.label}
          </span>
          <div className="flex items-center gap-1 text-xs text-navy-200/50">
            <User className="w-3 h-3" />
            <span>{action.owner}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function EvidenceCard({
  evidence,
  color,
  onClick,
}: {
  evidence: EvidenceItem;
  color: string;
  onClick: (evidence: EvidenceItem) => void;
}) {
  return (
    <div
      onClick={() => onClick(evidence)}
      className="glass-card p-4 relative overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-lg"
      style={{ borderColor: `${color}30` }}
    >
      <div
        className="absolute -top-px -left-px right-12 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `linear-gradient(90deg, ${color}80, transparent)` }}
      />
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ background: `linear-gradient(135deg, ${color}05 0%, transparent 40%)` }}
      />
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <span
            className="text-xs px-2 py-0.5 rounded font-medium"
            style={{ backgroundColor: `${color}15`, color }}
          >
            {evidence.source}
          </span>
          {evidence.heat !== undefined && evidence.heat > 0 && (
            <span className="flex items-center gap-1 text-xs text-alert-orange ml-auto">
              <Flame className="w-3 h-3" />
              <span className="tabular-nums">
                {evidence.heat >= 10000
                  ? `${(evidence.heat / 10000).toFixed(1)}万`
                  : evidence.heat.toLocaleString()}
              </span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-navy-200/50 mb-2">
          <div className="flex items-center gap-1">
            <User className="w-3 h-3" />
            <span>{evidence.author}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{evidence.time}</span>
          </div>
        </div>
        <p className="text-sm text-navy-200/60 leading-relaxed line-clamp-3 group-hover:text-navy-200/80 transition-colors duration-300">{evidence.summary}</p>
      </div>
    </div>
  );
}

function PhaseSection({
  phase,
  evidences,
  actions,
  index,
  onEvidenceClick,
}: {
  phase: PhaseConfig;
  evidences: EvidenceItem[];
  actions: ActionItem[];
  index: number;
  onEvidenceClick: (evidence: EvidenceItem) => void;
}) {
  const Icon = phase.icon;
  const hasContent = evidences.length > 0 || actions.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.12, duration: 0.5 }}
      className="glass-card p-5 relative overflow-hidden"
    >
      <div
        className="absolute -top-px -left-px right-0 h-0.5"
        style={{ background: `linear-gradient(90deg, ${phase.color}, transparent)` }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${phase.color}08 0%, transparent 40%)`,
        }}
      />

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-5">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${phase.color}15` }}
          >
            <Icon className="w-5 h-5" style={{ color: phase.color }} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-navy-50">{phase.label}</h3>
            <p className="text-xs text-navy-200/50">
              {hasContent
                ? `${evidences.length} 条关键证据${actions.length > 0 ? ` · ${actions.length} 条处置` : ""}`
                : "暂无数据"}
            </p>
          </div>
          <div
            className="ml-auto w-2 h-2 rounded-full"
            style={{ backgroundColor: hasContent ? phase.color : "transparent" }}
          />
        </div>

        {evidences.length > 0 && (
          <div className="space-y-3 mb-4">
            {evidences.map((evidence, i) => (
              <EvidenceCard key={i} evidence={evidence} color={phase.color} onClick={onEvidenceClick} />
            ))}
          </div>
        )}

        {actions.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs text-navy-200/40 font-medium mb-2">关联处置记录</div>
            {actions.map((action, i) => (
              <ActionCard key={i} action={action} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

const PLATFORM_NAME_MAP: Record<string, string> = {
  news: "新闻网站",
  video: "视频平台",
  forum: "论坛社区",
  social: "社交媒体",
};

export default function CrisisReviewPanel() {
  const { timelineNodes, opinions, actions } = useOpinionStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceItem | null>(null);

  const phaseData = useMemo(() => {
    const opinionMap = new Map(opinions.map((o) => [o.id, o]));

    const phases = PHASES.map((phase) => {
      const evidences: EvidenceItem[] = [];
      const actionsSet = new Set<string>();
      const actionItems: ActionItem[] = [];
      const collectedOpinionIds = new Set<string>();

      if (phase.key === "complaint") {
        timelineNodes
          .filter((n) => n.type === "seed" || n.type === "spread")
          .forEach((node) => {
            node.opinionIds.forEach((oid) => {
              const op = opinionMap.get(oid);
              if (op && op.category === "complaint" && !collectedOpinionIds.has(oid)) {
                collectedOpinionIds.add(oid);
                evidences.push({
                  source: "舆情条目",
                  author: op.author,
                  summary: op.summary,
                  time: op.publishTime,
                  heat: op.heat,
                  phase: phase.key,
                  opinionId: op.id,
                  platform: PLATFORM_NAME_MAP[op.platform] ?? op.platform,
                  relatedOpinionIds: [op.id],
                });
              }
            });
            if (node.propagationChain) {
              node.propagationChain.forEach((step) => {
                if (step.stepType === "complaint") {
                  evidences.push({
                    source: "传播链",
                    author: step.author,
                    authorTitle: step.authorTitle,
                    summary: step.content,
                    time: step.publishTime,
                    heat: step.heat,
                    phase: phase.key,
                    platform: step.platform,
                    nodeId: node.id,
                  });
                }
              });
            }
          });
      } else if (phase.key === "official") {
        timelineNodes
          .filter((n) => n.type === "response")
          .forEach((node) => {
            node.opinionIds.forEach((oid) => {
              const op = opinionMap.get(oid);
              if (op && !collectedOpinionIds.has(oid)) {
                collectedOpinionIds.add(oid);
                evidences.push({
                  source: "舆情条目",
                  author: op.author,
                  summary: op.summary,
                  time: op.publishTime,
                  heat: op.heat,
                  phase: phase.key,
                  opinionId: op.id,
                  platform: PLATFORM_NAME_MAP[op.platform] ?? op.platform,
                  relatedOpinionIds: [op.id],
                });
              }
            });
            if (node.propagationChain) {
              node.propagationChain.forEach((step) => {
                if (step.stepType === "official") {
                  evidences.push({
                    source: "传播链",
                    author: step.author,
                    authorTitle: step.authorTitle,
                    summary: step.content,
                    time: step.publishTime,
                    heat: step.heat,
                    phase: phase.key,
                    platform: step.platform,
                    nodeId: node.id,
                  });
                }
              });
            }
          });
      } else {
        const stepType = phase.key as PropagationStep["stepType"];
        timelineNodes.forEach((node) => {
          if (node.propagationChain) {
            node.propagationChain.forEach((step) => {
              if (step.stepType === stepType) {
                evidences.push({
                  source: "传播链",
                  author: step.author,
                  authorTitle: step.authorTitle,
                  summary: step.content,
                  time: step.publishTime,
                  heat: step.heat,
                  phase: phase.key,
                  platform: step.platform,
                  nodeId: node.id,
                });
              }
            });
          }
          node.opinionIds.forEach((oid) => {
            const op = opinionMap.get(oid);
            if (op && !collectedOpinionIds.has(oid)) {
              const isRelevant =
                (stepType === "kols_forward" && op.platform === "social") ||
                (stepType === "media_cite" && op.category === "media");
              if (isRelevant) {
                collectedOpinionIds.add(oid);
                evidences.push({
                  source: "舆情条目",
                  author: op.author,
                  summary: op.summary,
                  time: op.publishTime,
                  heat: op.heat,
                  phase: phase.key,
                  opinionId: op.id,
                  platform: PLATFORM_NAME_MAP[op.platform] ?? op.platform,
                  relatedOpinionIds: [op.id],
                });
              }
            }
          });
        });
      }

      evidences.sort((a, b) => a.time.localeCompare(b.time));

      collectedOpinionIds.forEach((oid) => actionsSet.add(oid));
      actions.forEach((action) => {
        const hasMatch = action.relatedOpinionIds.some((roid) => collectedOpinionIds.has(roid));
        if (hasMatch) {
          actionItems.push({
            title: action.title,
            status: action.status,
            owner: action.owner,
          });
        }
      });

      return { phase, evidences, actions: actionItems };
    });

    return phases;
  }, [timelineNodes, opinions, actions]);

  const handleEvidenceClick = (evidence: EvidenceItem) => {
    setSelectedEvidence(evidence);
    setModalOpen(true);
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {phaseData.map((data, index) => (
          <PhaseSection
            key={data.phase.key}
            phase={data.phase}
            evidences={data.evidences}
            actions={data.actions}
            index={index}
            onEvidenceClick={handleEvidenceClick}
          />
        ))}
      </div>
      <EvidenceDetailModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        evidence={selectedEvidence}
      />
    </>
  );
}
