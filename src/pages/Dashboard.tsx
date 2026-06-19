import { useOpinionStore } from "@/store/useOpinionStore";
import { motion } from "framer-motion";
import type { Category } from "@/types";
import BrandConfigPanel from "@/components/dashboard/BrandConfigPanel";
import AlertRulePanel from "@/components/dashboard/AlertRulePanel";
import StatCard from "@/components/dashboard/StatCard";
import SentimentRing from "@/components/dashboard/SentimentRing";
import PlatformChart from "@/components/dashboard/PlatformChart";
import RegionHeatmap from "@/components/dashboard/RegionHeatmap";
import CompetitorCompare from "@/components/dashboard/CompetitorCompare";
import OpinionCard from "@/components/dashboard/OpinionCard";
import ReportGenerator from "@/components/dashboard/ReportGenerator";

const CATEGORY_ORDER: Category[] = ["complaint", "media", "rumor", "official"];

const CATEGORY_TITLES: Record<Category, string> = {
  complaint: "用户投诉",
  media: "媒体报道",
  rumor: "谣言信息",
  official: "官方回应",
};

const CATEGORY_COLORS: Record<Category, string> = {
  complaint: "#FF4D4F",
  media: "#1890FF",
  rumor: "#FA8C16",
  official: "#52C41A",
};

export default function Dashboard() {
  const { opinions } = useOpinionStore();

  const groupedOpinions = CATEGORY_ORDER.reduce((acc, category) => {
    acc[category] = opinions.filter((op) => op.category === category);
    return acc;
  }, {} as Record<Category, typeof opinions>);

  return (
    <div className="max-w-full mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl md:text-3xl font-bold text-navy-50 mb-1">
          舆情总览
        </h1>
        <p className="text-navy-200/50">实时监控品牌舆情动态，掌握市场声音</p>
      </motion.div>

      <BrandConfigPanel />

      <AlertRulePanel />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="总声量"
          value={28471}
          change={12.3}
          trend="up"
          color="red"
        />
        <StatCard
          title="负面占比"
          value="68%"
          change={8.2}
          trend="up"
          color="red"
        />
        <StatCard
          title="媒体报道"
          value="156条"
          change={23}
          trend="up"
          color="orange"
        />
        <StatCard
          title="官方回应覆盖"
          value="42%"
          change={5.1}
          trend="up"
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <SentimentRing />
        <PlatformChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <RegionHeatmap />
        <CompetitorCompare />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-5">
          <h2 className="text-xl font-semibold text-navy-50">分类舆情</h2>
          <div className="flex-1 h-px bg-gradient-to-r from-navy-600/50 to-transparent" />
        </div>

        {CATEGORY_ORDER.map((category) => {
          const items = groupedOpinions[category];
          if (items.length === 0) return null;

          return (
            <div key={category} className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <span
                  className="w-1 h-5 rounded-full"
                  style={{ backgroundColor: CATEGORY_COLORS[category] }}
                />
                <h3
                  className="text-base font-medium"
                  style={{ color: CATEGORY_COLORS[category] }}
                >
                  {CATEGORY_TITLES[category]}
                </h3>
                <span className="text-navy-200/40 text-sm">
                  共 {items.length} 条
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {items.map((opinion, idx) => (
                  <OpinionCard key={opinion.id} opinion={opinion} index={idx} />
                ))}
              </div>
            </div>
          );
        })}
      </motion.div>

      <div className="mt-10">
        <ReportGenerator />
      </div>
    </div>
  );
}
