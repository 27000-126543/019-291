import { motion } from "framer-motion";
import {
  User,
  Clock,
  Eye,
  MessageCircle,
  Share2,
  ArrowRight,
  Flame,
  TrendingUp,
} from "lucide-react";
import type { OpinionItem } from "@/types";
import { cn } from "@/lib/utils";

interface KeyEventCardProps {
  opinion: OpinionItem;
  index: number;
}

const PLATFORM_LABELS: Record<string, string> = {
  news: "新闻媒体",
  video: "短视频",
  forum: "论坛社区",
  social: "社交媒体",
};

const PLATFORM_COLORS: Record<string, string> = {
  news: "#1890FF",
  video: "#EB2F96",
  forum: "#722ED1",
  social: "#13C2C2",
};

export default function KeyEventCard({ opinion, index }: KeyEventCardProps) {
  const platformColor = PLATFORM_COLORS[opinion.platform] || "#1890FF";
  const isHighRead = opinion.reads >= 100000;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className={cn(
        "glass-card flex-shrink-0 w-80 p-5 relative overflow-hidden group cursor-pointer",
        "transition-all duration-300 hover:shadow-card"
      )}
      style={{
        borderColor: `${platformColor}40`,
        boxShadow: `0 0 30px ${platformColor}10`,
      }}
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${platformColor}15 0%, transparent 60%)`,
        }}
      />

      <div
        className="absolute -top-px -left-px right-16 h-px"
        style={{
          background: `linear-gradient(90deg, ${platformColor}, transparent)`,
        }}
      />
      <div
        className="absolute -top-px -left-px bottom-16 w-px"
        style={{
          background: `linear-gradient(180deg, ${platformColor}, transparent)`,
        }}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${platformColor}20` }}
            >
              <Flame className="w-4 h-4" style={{ color: platformColor }} />
            </div>
            <div className="flex flex-col">
              <span
                className="text-xs font-medium px-2 py-0.5 rounded"
                style={{
                  backgroundColor: `${platformColor}15`,
                  color: platformColor,
                }}
              >
                {PLATFORM_LABELS[opinion.platform]}
              </span>
            </div>
          </div>
          {isHighRead && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1 + 0.2, type: "spring" }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-gradient-to-r from-alert-orange to-alert-red text-white text-xs font-bold"
            >
              <TrendingUp className="w-3 h-3" />
              <span>10W+</span>
            </motion.div>
          )}
        </div>

        <h3 className="text-lg font-bold text-navy-50 mb-3 line-clamp-2 leading-snug group-hover:text-white transition-colors">
          {opinion.title}
        </h3>

        <p className="text-navy-200/60 text-sm mb-4 line-clamp-2 leading-relaxed">
          {opinion.summary}
        </p>

        <div className="flex items-center gap-4 text-xs text-navy-200/50 mb-4">
          <div className="flex items-center gap-1.5 min-w-0">
            <User className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{opinion.author}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{opinion.publishTime.split(" ")[0]}</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-navy-200/50 mb-5 pb-4 border-b border-navy-700/40">
          <div className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            <span className="tabular-nums">
              {opinion.reads >= 10000
                ? `${(opinion.reads / 10000).toFixed(1)}万`
                : opinion.reads.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="w-3.5 h-3.5" />
            <span className="tabular-nums">
              {opinion.comments >= 10000
                ? `${(opinion.comments / 10000).toFixed(1)}万`
                : opinion.comments.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Share2 className="w-3.5 h-3.5" />
            <span className="tabular-nums">
              {opinion.shares >= 10000
                ? `${(opinion.shares / 10000).toFixed(1)}万`
                : opinion.shares.toLocaleString()}
            </span>
          </div>
        </div>

        <motion.button
          whileHover={{ x: 4 }}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-medium transition-all duration-300"
          style={{
            backgroundColor: `${platformColor}15`,
            color: platformColor,
            border: `1px solid ${platformColor}30`,
          }}
        >
          <span>查看详情</span>
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  );
}
