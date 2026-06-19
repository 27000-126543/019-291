import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Megaphone,
  Scale,
  Headphones,
  ShieldCheck,
  LayoutGrid,
  Users,
  Clock,
  AlertTriangle,
  Filter,
  ChevronDown,
  ChevronUp,
  Flame,
} from "lucide-react";
import type { ActionRecord, OpinionItem } from "@/types";
import { cn } from "@/lib/utils";

interface CrossDeptViewProps {
  actions: ActionRecord[];
  opinions: OpinionItem[];
  onViewChange: (view: "kanban" | "cross") => void;
  onEdit?: (action: ActionRecord) => void;
}

type Department = "pr" | "legal" | "cs" | "qa";
type FilterType = "all" | "stuck";

const DEPARTMENT_CONFIG: Record<
  Department,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string; bgColor: string; borderColor: string }
> = {
  pr: {
    label: "公关部",
    icon: Megaphone,
    color: "text-alert-blue",
    bgColor: "bg-alert-blue/10",
    borderColor: "border-alert-blue/30",
  },
  legal: {
    label: "法务部",
    icon: Scale,
    color: "text-navy-200",
    bgColor: "bg-navy-600/30",
    borderColor: "border-navy-500/30",
  },
  cs: {
    label: "客服部",
    icon: Headphones,
    color: "text-alert-green",
    bgColor: "bg-alert-green/10",
    borderColor: "border-alert-green/30",
  },
  qa: {
    label: "质量部",
    icon: ShieldCheck,
    color: "text-alert-orange",
    bgColor: "bg-alert-orange/10",
    borderColor: "border-alert-orange/30",
  },
};

const STATUS_LABELS: Record<string, string> = {
  pending: "待处理",
  in_progress: "进行中",
  done: "已完成",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-navy-600/50 text-navy-100",
  in_progress: "bg-alert-blue/15 text-alert-blue",
  done: "bg-alert-green/15 text-alert-green",
};

interface EventCluster {
  key: string;
  opinionIds: string[];
  opinions: OpinionItem[];
  title: string;
  totalHeat: number;
  actions: ActionRecord[];
  hasStuck: boolean;
}

function parseDateTime(timeStr: string): Date {
  return new Date(timeStr.replace(/-/g, "/"));
}

function isStuck(action: ActionRecord): boolean {
  if (action.status === "done") return false;
  const lastUpdateTime =
    action.updates.length > 0
      ? parseDateTime(action.updates[action.updates.length - 1].time)
      : parseDateTime(action.createdAt);
  const now = new Date("2026-06-19 12:00".replace(/-/g, "/"));
  const diffHours = (now.getTime() - lastUpdateTime.getTime()) / (1000 * 60 * 60);
  return diffHours > 24;
}

function getLastUpdateInfo(action: ActionRecord): { time: string; operator: string } {
  if (action.updates.length > 0) {
    const last = action.updates[action.updates.length - 1];
    return { time: last.time, operator: last.operator };
  }
  return { time: action.createdAt, operator: action.owner };
}

export default function CrossDeptView({
  actions,
  opinions,
  onViewChange,
  onEdit,
}: CrossDeptViewProps) {
  const [filter, setFilter] = useState<FilterType>("all");
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());

  const clusters = useMemo<EventCluster[]>(() => {
    const opinionMap = new Map<string, OpinionItem>();
    opinions.forEach((op) => opinionMap.set(op.id, op));

    const clusterMap = new Map<string, EventCluster>();

    actions.forEach((action) => {
      const key =
        action.relatedOpinionIds.length > 0
          ? action.relatedOpinionIds.slice().sort().join("|")
          : "unassigned";

      if (!clusterMap.has(key)) {
        const relatedOps = action.relatedOpinionIds
          .map((id) => opinionMap.get(id))
          .filter((op): op is OpinionItem => !!op);

        const totalHeat = relatedOps.reduce((sum, op) => sum + op.heat, 0);
        const topOpinion =
          relatedOps.length > 0
            ? relatedOps.reduce((a, b) => (a.heat >= b.heat ? a : b))
            : null;

        clusterMap.set(key, {
          key,
          opinionIds: action.relatedOpinionIds.slice(),
          opinions: relatedOps,
          title: topOpinion
            ? topOpinion.title
            : action.relatedOpinionIds.length === 0
            ? "独立处置任务（未关联舆情）"
            : "关联舆情事件",
          totalHeat,
          actions: [],
          hasStuck: false,
        });
      }

      const cluster = clusterMap.get(key)!;
      cluster.actions.push(action);
      if (isStuck(action)) {
        cluster.hasStuck = true;
      }
    });

    const result = Array.from(clusterMap.values()).sort((a, b) => {
      if (b.hasStuck !== a.hasStuck) return b.hasStuck ? 1 : -1;
      return b.totalHeat - a.totalHeat;
    });

    return result;
  }, [actions, opinions]);

  const filteredClusters = useMemo(() => {
    if (filter === "stuck") {
      return clusters.filter((c) => c.hasStuck);
    }
    return clusters;
  }, [clusters, filter]);

  const toggleExpand = (key: string) => {
    setExpandedEvents((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const getDeptStats = (deptActions: ActionRecord[]) => {
    return {
      pending: deptActions.filter((a) => a.status === "pending").length,
      in_progress: deptActions.filter((a) => a.status === "in_progress").length,
      done: deptActions.filter((a) => a.status === "done").length,
      total: deptActions.length,
    };
  };

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center p-1 bg-navy-800/80 rounded-lg border border-navy-700/50">
            <button
              onClick={() => onViewChange("kanban")}
              className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-navy-200/70 hover:text-white hover:bg-navy-700/50 transition-all"
            >
              <LayoutGrid className="w-4 h-4" />
              <span>看板视图</span>
            </button>
            <button
              onClick={() => onViewChange("cross")}
              className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-alert-blue/20 text-alert-blue border border-alert-blue/30 shadow-glow transition-all"
            >
              <Users className="w-4 h-4" />
              <span>协同视图</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-navy-200/60 text-sm">
            <Filter className="w-4 h-4" />
            <span>筛选：</span>
          </div>
          <div className="flex items-center p-0.5 bg-navy-800/80 rounded-lg border border-navy-700/50">
            <button
              onClick={() => setFilter("all")}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                filter === "all"
                  ? "bg-navy-600/60 text-white"
                  : "text-navy-200/60 hover:text-white hover:bg-navy-700/40"
              )}
            >
              全部
            </button>
            <button
              onClick={() => setFilter("stuck")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                filter === "stuck"
                  ? "bg-alert-red/20 text-alert-red border border-alert-red/30"
                  : "text-navy-200/60 hover:text-alert-red hover:bg-alert-red/10"
              )}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>有卡点</span>
              <span className="px-1.5 py-0.5 text-xs rounded bg-alert-red/20 text-alert-red">
                {clusters.filter((c) => c.hasStuck).length}
              </span>
            </button>
          </div>
        </div>
      </div>

      {filteredClusters.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <p className="text-navy-200/40 text-lg">暂无符合条件的事件</p>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredClusters.map((cluster, clusterIdx) => {
            const isExpanded = expandedEvents.has(cluster.key);
            const departments: Department[] = ["pr", "legal", "cs", "qa"];

            return (
              <motion.div
                key={cluster.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: clusterIdx * 0.05 }}
                className={cn(
                  "glass-card overflow-hidden transition-all duration-300",
                  cluster.hasStuck &&
                    "border-2 border-alert-red/60 shadow-glow-red"
                )}
              >
                <div
                  className={cn(
                    "p-5 cursor-pointer transition-colors",
                    cluster.hasStuck
                      ? "bg-gradient-to-r from-alert-red/10 via-transparent to-transparent"
                      : "hover:bg-navy-700/30"
                  )}
                  onClick={() => toggleExpand(cluster.key)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap mb-2">
                        {cluster.hasStuck && (
                          <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-alert-red/20 text-alert-red text-xs font-semibold border border-alert-red/30">
                            <Flame className="w-3.5 h-3.5" />
                            存在卡点
                          </span>
                        )}
                        {cluster.opinions.length > 0 && (
                          <span className="px-2.5 py-1 rounded-md bg-navy-600/40 text-navy-100 text-xs font-medium">
                            关联舆情 {cluster.opinions.length} 条
                          </span>
                        )}
                        {cluster.totalHeat > 0 && (
                          <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-alert-orange/15 text-alert-orange text-xs font-medium">
                            <Flame className="w-3.5 h-3.5" />
                            热度 {cluster.totalHeat.toLocaleString()}
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-semibold text-navy-50 mb-1 line-clamp-1 group-hover:text-white transition-colors">
                        {cluster.title}
                      </h3>

                      <div className="flex items-center gap-6 text-sm text-navy-200/50 mt-2">
                        <span>
                          处置任务{" "}
                          <span className="text-navy-100 font-medium">
                            {cluster.actions.length}
                          </span>{" "}
                          项
                        </span>
                        <span>
                          已完成{" "}
                          <span className="text-alert-green font-medium">
                            {cluster.actions.filter((a) => a.status === "done").length}
                          </span>{" "}
                          项
                        </span>
                        <span>
                          进行中{" "}
                          <span className="text-alert-blue font-medium">
                            {
                              cluster.actions.filter((a) => a.status === "in_progress")
                                .length
                            }
                          </span>{" "}
                          项
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="grid grid-cols-4 gap-1.5">
                        {departments.map((dept) => {
                          const deptActions = cluster.actions.filter(
                            (a) => a.department === dept
                          );
                          const config = DEPARTMENT_CONFIG[dept];
                          const hasAction = deptActions.length > 0;
                          const DeptIcon = config.icon;

                          return (
                            <div
                              key={dept}
                              className={cn(
                                "w-10 h-10 rounded-lg flex items-center justify-center border transition-all",
                                hasAction
                                  ? cn(config.bgColor, config.borderColor)
                                  : "bg-navy-800/50 border-navy-700/30 opacity-40"
                              )}
                              title={`${config.label}: ${deptActions.length}项`}
                            >
                              <DeptIcon
                                className={cn(
                                  "w-5 h-5",
                                  hasAction ? config.color : "text-navy-200/30"
                                )}
                              />
                            </div>
                          );
                        })}
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-navy-200/50" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-navy-200/50" />
                      )}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-navy-700/40 p-5"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {departments.map((dept) => {
                        const deptActions = cluster.actions.filter(
                          (a) => a.department === dept
                        );
                        const config = DEPARTMENT_CONFIG[dept];
                        const stats = getDeptStats(deptActions);
                        const DeptIcon = config.icon;

                        return (
                          <div
                            key={dept}
                            className={cn(
                              "rounded-lg p-4 border transition-all",
                              config.bgColor,
                              config.borderColor
                            )}
                          >
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-2.5">
                                <div
                                  className={cn(
                                    "w-9 h-9 rounded-lg flex items-center justify-center",
                                    "bg-navy-900/60 border",
                                    config.borderColor
                                  )}
                                >
                                  <DeptIcon
                                    className={cn("w-5 h-5", config.color)}
                                  />
                                </div>
                                <div>
                                  <h4
                                    className={cn(
                                      "font-semibold text-base",
                                      config.color
                                    )}
                                  >
                                    {config.label}
                                  </h4>
                                  <p className="text-xs text-navy-200/40">
                                    共 {stats.total} 项任务
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded text-xs font-medium bg-navy-600/50 text-navy-100">
                                  待 {stats.pending}
                                </span>
                                <span className="px-2 py-0.5 rounded text-xs font-medium bg-alert-blue/15 text-alert-blue">
                                  中 {stats.in_progress}
                                </span>
                                <span className="px-2 py-0.5 rounded text-xs font-medium bg-alert-green/15 text-alert-green">
                                  完 {stats.done}
                                </span>
                              </div>
                            </div>

                            {deptActions.length === 0 ? (
                              <div className="py-8 text-center text-navy-200/30 text-sm">
                                暂无相关任务
                              </div>
                            ) : (
                              <div className="space-y-2.5">
                                {deptActions.map((action) => {
                                  const stuck = isStuck(action);
                                  const lastInfo = getLastUpdateInfo(action);

                                  return (
                                    <div
                                      key={action.id}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onEdit?.(action);
                                      }}
                                      className={cn(
                                        "rounded-lg p-3 cursor-pointer transition-all group",
                                        "bg-navy-900/60 border border-navy-700/40",
                                        "hover:bg-navy-800/80 hover:border-navy-600/50",
                                        stuck &&
                                          "border-alert-red/50 hover:border-alert-red/70 bg-alert-red/5"
                                      )}
                                    >
                                      <div className="flex items-start justify-between gap-3 mb-2">
                                        <h5 className="text-sm font-medium text-navy-50 line-clamp-1 group-hover:text-white transition-colors flex-1">
                                          {action.title}
                                        </h5>
                                        <div className="flex items-center gap-1.5 flex-shrink-0">
                                          {stuck && (
                                            <span className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-alert-red/20 text-alert-red border border-alert-red/30">
                                              <AlertTriangle className="w-3 h-3" />
                                              卡点
                                            </span>
                                          )}
                                          <span
                                            className={cn(
                                              "px-2 py-0.5 rounded text-xs font-medium",
                                              STATUS_COLORS[action.status]
                                            )}
                                          >
                                            {STATUS_LABELS[action.status]}
                                          </span>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-4 text-xs text-navy-200/50">
                                        <div className="flex items-center gap-1">
                                          <Users className="w-3.5 h-3.5" />
                                          <span>{action.owner}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <Clock className="w-3.5 h-3.5" />
                                          <span>
                                            更新于 {lastInfo.time} ·{" "}
                                            {lastInfo.operator}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
