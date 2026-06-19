import { motion } from "framer-motion";
import { Eye, MessageCircle, Share2, User, Clock, TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { OpinionItem } from "@/types";
import { cn } from "@/lib/utils";

interface OpinionCardProps {
  opinion: OpinionItem;
  index: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  complaint: "#FF4D4F",
  media: "#1890FF",
  rumor: "#FA8C16",
  official: "#52C41A",
};

const CATEGORY_LABELS: Record<string, string> = {
  complaint: "用户投诉",
  media: "媒体报道",
  rumor: "谣言信息",
  official: "官方回应",
};

const PLATFORM_LABELS: Record<string, string> = {
  news: "新闻",
  video: "短视频",
  forum: "论坛",
  social: "社交",
};

export default function OpinionCard({ opinion, index }: OpinionCardProps) {
  const categoryColor = CATEGORY_COLORS[opinion.category];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="glass-card overflow-hidden cursor-pointer group hover:shadow-card transition-all duration-300"
    >
      <div className="flex">
        <div
          className="w-1.5 flex-shrink-0"
          style={{ backgroundColor: categoryColor }}
        />
        <div className="flex-1 p-4 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h4 className="text-navy-50 font-semibold text-base leading-snug line-clamp-2 group-hover:text-white transition-colors">
              {opinion.title}
            </h4>
            <span
              className="flex-shrink-0 px-2 py-0.5 rounded text-xs font-medium"
              style={{
                backgroundColor: `${categoryColor}15`,
                color: categoryColor,
              }}
            >
              {CATEGORY_LABELS[opinion.category]}
            </span>
          </div>

          <p className="text-navy-200/60 text-sm mb-3 line-clamp-2">
            {opinion.summary}
          </p>

          <div className="flex items-center gap-4 text-xs text-navy-200/50 mb-3">
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span className="truncate max-w-20">{opinion.author}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{opinion.publishTime}</span>
            </div>
            <span
              className="px-2 py-0.5 rounded"
              style={{
                backgroundColor: "rgba(100, 139, 197, 0.15)",
              }}
            >
              {PLATFORM_LABELS[opinion.platform] || opinion.platform}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-navy-200/50">
              <div className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                <span>{opinion.reads.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="w-3.5 h-3.5" />
                <span>{opinion.comments.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Share2 className="w-3.5 h-3.5" />
                <span>{opinion.shares.toLocaleString()}</span>
              </div>
            </div>

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.05 + 0.2 }}
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-md font-semibold text-sm",
                opinion.heatTrend === "up"
                  ? "bg-alert-red/10 text-alert-red"
                  : opinion.heatTrend === "down"
                  ? "bg-alert-green/10 text-alert-green"
                  : "bg-navy-600/30 text-navy-200"
              )}
            >
              {opinion.heatTrend === "up" ? (
                <TrendingUp className="w-4 h-4" />
              ) : opinion.heatTrend === "down" ? (
                <TrendingDown className="w-4 h-4" />
              ) : (
                <Minus className="w-4 h-4" />
              )}
              <span className="tabular-nums">{opinion.heat.toLocaleString()}</span>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
