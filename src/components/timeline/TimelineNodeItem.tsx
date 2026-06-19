import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import type { TimelineNode } from "@/types";
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

export default function TimelineNodeItem({ node, index }: TimelineNodeItemProps) {
  const isLeft = index % 2 === 0;
  const importanceColor = IMPORTANCE_COLORS[node.importance];
  const typeColor = TYPE_COLORS[node.type];
  const isHighImportance = node.importance === "high";

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
            </div>
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
                  background: `linear-gradient(225deg, ${importanceColor}10 0%, transparent 60%)`,
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
            </div>
          </motion.div>
        ) : null}
      </div>
    </motion.div>
  );
}
