import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, Flame, GitBranch, ChevronLeft, ChevronRight, ClipboardCheck } from "lucide-react";
import { useOpinionStore } from "@/store/useOpinionStore";
import { cn } from "@/lib/utils";
import SentimentTrendChart from "@/components/timeline/SentimentTrendChart";
import KeyEventCard from "@/components/timeline/KeyEventCard";
import TimelineNodeItem from "@/components/timeline/TimelineNodeItem";
import CrisisReviewPanel from "@/components/timeline/CrisisReviewPanel";

type TimeRange = "7d" | "14d" | "all";
type ViewMode = "timeline" | "crisis";

const TIME_RANGES: { value: TimeRange; label: string }[] = [
  { value: "7d", label: "近7天" },
  { value: "14d", label: "近14天" },
  { value: "all", label: "全部" },
];

const VIEW_TABS: { value: ViewMode; label: string; icon: typeof GitBranch }[] = [
  { value: "timeline", label: "传播时间线", icon: GitBranch },
  { value: "crisis", label: "危机复盘", icon: ClipboardCheck },
];

const pageVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const sectionVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Timeline() {
  const { timelineNodes, opinions } = useOpinionStore();
  const [timeRange, setTimeRange] = useState<TimeRange>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("timeline");

  const highImpactOpinions = useMemo(() => {
    return [...opinions]
      .sort((a, b) => b.heat - a.heat)
      .slice(0, 4);
  }, [opinions]);

  const handleScroll = (direction: "left" | "right") => {
    const container = document.getElementById("key-events-scroll");
    if (container) {
      const scrollAmount = 340;
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="max-w-full mx-auto"
    >
      <motion.div variants={sectionVariants} className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-navy-50 mb-1">
              事件时间线
            </h1>
            <p className="text-navy-200/50">
              完整追踪舆情事件的发展脉络与关键节点
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="glass-card p-1 flex">
              {VIEW_TABS.map((tab) => {
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.value}
                    onClick={() => setViewMode(tab.value)}
                    className={cn(
                      "px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-1.5",
                      viewMode === tab.value
                        ? "bg-alert-blue/20 text-alert-blue"
                        : "text-navy-200/60 hover:text-navy-100 hover:bg-navy-700/30"
                    )}
                  >
                    <TabIcon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
            <div className="w-9 h-9 rounded-lg bg-alert-blue/15 flex items-center justify-center ml-1">
              <CalendarDays className="w-4.5 h-4.5 text-alert-blue" />
            </div>
            <div className="glass-card p-1 flex">
              {TIME_RANGES.map((range) => (
                <button
                  key={range.value}
                  onClick={() => setTimeRange(range.value)}
                  className={cn(
                    "px-4 py-2 rounded-md text-sm font-medium transition-all duration-200",
                    timeRange === range.value
                      ? "bg-alert-blue/20 text-alert-blue"
                      : "text-navy-200/60 hover:text-navy-100 hover:bg-navy-700/30"
                  )}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={sectionVariants} className="mb-8">
        <SentimentTrendChart />
      </motion.div>

      <motion.div variants={sectionVariants} className="mb-10">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-alert-orange/15 flex items-center justify-center">
              <Flame className="w-5 h-5 text-alert-orange" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-navy-50">高影响力事件</h2>
              <p className="text-navy-200/50 text-sm">按热度排序的关键舆论事件</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleScroll("left")}
              className="w-9 h-9 rounded-lg glass-card flex items-center justify-center text-navy-200/70 hover:text-white hover:bg-navy-700/50 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleScroll("right")}
              className="w-9 h-9 rounded-lg glass-card flex items-center justify-center text-navy-200/70 hover:text-white hover:bg-navy-700/50 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div
          id="key-events-scroll"
          className="flex gap-4 overflow-x-auto pb-4 scroll-smooth"
          style={{ scrollbarWidth: "none" }}
        >
          {highImpactOpinions.map((opinion, index) => (
            <KeyEventCard key={opinion.id} opinion={opinion} index={index} />
          ))}
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {viewMode === "timeline" ? (
          <motion.div
            key="timeline"
            variants={sectionVariants}
            initial="initial"
            animate="animate"
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-lg bg-alert-blue/15 flex items-center justify-center">
                <GitBranch className="w-5 h-5 text-alert-blue" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-navy-50">事件传播时间线</h2>
                <p className="text-navy-200/50 text-sm">按时间顺序展示事件发展全过程</p>
              </div>
            </div>
            <div className="relative">
              <div className="space-y-12 py-4">
                {timelineNodes.map((node, index) => (
                  <TimelineNodeItem key={node.id} node={node} index={index} />
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="crisis"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-lg bg-alert-green/15 flex items-center justify-center">
                <ClipboardCheck className="w-5 h-5 text-alert-green" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-navy-50">危机复盘</h2>
                <p className="text-navy-200/50 text-sm">按阶段梳理关键证据与处置记录</p>
              </div>
            </div>
            <CrisisReviewPanel />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
