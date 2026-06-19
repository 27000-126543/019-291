import { motion } from "framer-motion";
import { Clock, User, Flame, Newspaper, Megaphone, AlertTriangle, ArrowRight } from "lucide-react";
import type { TimelineNode, PropagationStep } from "@/types";
import { cn } from "@/lib/utils";

interface TimelineNodeItemProps {
  node: TimelineNode;
  index: number;
}

const IMPORTANCE_COLORS: Record<string, string> = {
  high: "#FF4D4F",
  medium: "#FA8C16",
  low: "#1890FF",
};

const TYPE_LABELS: Record<string, string> = {
  seed: "萌芽",
  spread: "扩散",
  peak: "高峰",
  response: "回应",
  decline: "回落",
};

const TYPE_COLORS: Record<string, string> = {
  seed: "#722ED1",
  spread: "#FA8C16",
  peak: "#FF4D4F",
  response: "#52C41A",
  decline: "#1890FF",
};

const STEP_ICON_MAP: Record<PropagationStep["stepType"], typeof User> = {
  complaint: User,
  kols_forward: Flame,
  media_cite: Newspaper,
  official: Megaphone,
  rumor: AlertTriangle,
};

const STEP_LABEL_MAP: Record<PropagationStep["stepType"], string> = {
  complaint: "投诉",
  kols_forward: "大号转发",
  media_cite: "媒体引用",
  official: "官方",
  rumor: "谣言",
};

const STEP_COLOR_MAP: Record<PropagationStep["stepType"], string> = {
  complaint: "#1890FF",
  kols_forward: "#FA8C16",
  media_cite: "#722ED1",
  official: "#52C41A",
  rumor: "#FF4D4F",
};

function PropagationChain({ chain }: { chain: PropagationStep[] }) {
  return (
    <div className="mt-5 pt-4 border-t border-navy-700/40">
      <div className="text-xs text-navy-200/50 mb-3 font-medium">传播链路</div>
      <div className="space-y-0">
        {chain.map((step, stepIndex) => {
          const StepIcon = STEP_ICON_MAP[step.stepType];
          const stepColor = STEP_COLOR_MAP[step.stepType];
          const isLast = stepIndex === chain.length - 1;

          return (
            <div key={stepIndex} className="relative">
              <div className="flex gap-3">
                <div className="relative flex flex-col items-center">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                      "border border-opacity-30"
                    )}
                    style={{
                      backgroundColor: `${stepColor}15`,
                      borderColor: `${stepColor}40`,
                    }}
                  >
                    <StepIcon
                      className="w-4 h-4"
                      style={{ color: stepColor }}
                    />
                  </div>
                  {!isLast && (
                    <div className="flex-1 w-0.5 mt-1 mb-1 bg-gradient-to-b from-navy-600/60 to-navy-700/30 relative">
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-navy-600/60" />
                    </div>
                  )}
                </div>

                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-medium"
                      style={{
                        backgroundColor: `${stepColor}20`,
                        color: stepColor,
                        border: `1px solid ${stepColor}30`,
                      }}
                    >
                      {STEP_LABEL_MAP[step.stepType]}
                    </span>
                    <span className="text-sm font-medium text-navy-100">
                      {step.author}
                    </span>
                    <span className="text-xs text-navy-200/50">
                      {step.authorTitle}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-1.5 text-xs text-navy-200/50">
                    <span className="px-1.5 py-0.5 rounded bg-navy-700/40 text-navy-200/70">
                      {step.platform}
                    </span>
                    <Clock className="w-3 h-3" />
                    <span>{step.publishTime}</span>
                    {step.heat !== undefined && step.heat > 0 && (
                      <span className="flex items-center gap-1 ml-auto">
                        <Flame className="w-3 h-3 text-alert-orange" />
                        <span className="text-alert-orange tabular-nums">
                          {step.heat >= 10000
                            ? `${(step.heat / 10000).toFixed(1)}万`
                            : step.heat.toLocaleString()}
                        </span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-navy-200/60 leading-relaxed line-clamp-2">
                    {step.content}
                  </p>
                </div>
              </div>

              {!isLast && (
                <div className="absolute left-4 top-8 flex items-center justify-center">
                  <ArrowRight className="w-3 h-3 text-navy-500/50" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function NodeCardContent({ node }: { node: TimelineNode }) {
  const importanceColor = IMPORTANCE_COLORS[node.importance];
  const typeColor = TYPE_COLORS[node.type];
  const isHighImportance = node.importance === "high";

  return (
    <div
      className={cn(
        "glass-card p-5 max-w-md w-full relative overflow-hidden group",
        "transition-all duration-300",
        isHighImportance && "border-alert-red/50 shadow-glow-red"
      )}
    >
      {isHighImportance && (
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `linear-gradient(135deg, ${importanceColor}10 0%, transparent 60%)`,
          }}
        />
      )}
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1.5 text-navy-200/60 text-sm">
            <Clock className="w-3.5 h-3.5" />
            <span>{node.time}</span>
          </div>
          <span
            className="px-2.5 py-0.5 rounded text-xs font-medium"
            style={{
              backgroundColor: `${typeColor}20`,
              color: typeColor,
              border: `1px solid ${typeColor}30`,
            }}
          >
            {TYPE_LABELS[node.type]}
          </span>
        </div>
        <h3 className="text-lg font-semibold text-navy-50 mb-2 group-hover:text-white transition-colors">
          {node.title}
        </h3>
        <p className="text-navy-200/60 text-sm leading-relaxed">
          {node.description}
        </p>
        {node.propagationChain && node.propagationChain.length > 0 && (
          <PropagationChain chain={node.propagationChain} />
        )}
      </div>
    </div>
  );
}

export default function TimelineNodeItem({ node, index }: TimelineNodeItemProps) {
  const isLeft = index % 2 === 0;
  const importanceColor = IMPORTANCE_COLORS[node.importance];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="relative flex items-center"
    >
      <div
        className={cn(
          "flex-1 flex items-center",
          isLeft ? "justify-end pr-10" : "justify-start pl-10"
        )}
      >
        {isLeft ? (
          <motion.div
            whileHover={{ scale: 1.02, x: -4 }}
            transition={{ duration: 0.2 }}
          >
            <NodeCardContent node={node} />
          </motion.div>
        ) : null}
      </div>

      <div className="relative flex-shrink-0 flex flex-col items-center">
        <div className="absolute top-0 bottom-0 w-0.5 bg-gradient-to-b from-alert-blue/60 via-alert-orange/40 to-alert-red/60" />
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.1 + 0.15, type: "spring", stiffness: 200 }}
          className="relative z-10"
        >
          <div
            className={cn(
              "w-5 h-5 rounded-full border-2 border-navy-950",
              "flex items-center justify-center"
            )}
            style={{ backgroundColor: importanceColor }}
          >
            <div
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: importanceColor, opacity: 0.8 }}
            />
          </div>
          <div
            className="absolute inset-0 rounded-full blur-md animate-pulse"
            style={{ backgroundColor: importanceColor, opacity: 0.5 }}
          />
        </motion.div>
      </div>

      <div
        className={cn(
          "flex-1 flex items-center",
          isLeft ? "justify-start pl-10" : "justify-end pr-10"
        )}
      >
        {!isLeft ? (
          <motion.div
            whileHover={{ scale: 1.02, x: 4 }}
            transition={{ duration: 0.2 }}
          >
            <NodeCardContent node={node} />
          </motion.div>
        ) : null}
      </div>
    </motion.div>
  );
}
