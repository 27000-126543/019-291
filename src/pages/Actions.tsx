import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Sun, LayoutGrid, Users } from "lucide-react";
import { useOpinionStore } from "@/store/useOpinionStore";
import type { ActionRecord } from "@/types";
import { cn } from "@/lib/utils";
import RiskColumn from "@/components/actions/RiskColumn";
import MorningMeetingView from "@/components/actions/MorningMeetingView";
import CrossDeptView from "@/components/actions/CrossDeptView";
import ActionForm from "@/components/actions/ActionForm";

type ActionsViewMode = "kanban" | "morning" | "cross";

export default function Actions() {
  const {
    actions,
    opinions,
    isMorningView,
    actionsView,
    toggleMorningView,
    setActionsView,
    addAction,
    updateAction,
    addActionUpdate,
  } = useOpinionStore();

  const [formOpen, setFormOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<ActionRecord | null>(null);

  const viewMode: ActionsViewMode = actionsView === "cross" ? "cross" : isMorningView ? "morning" : "kanban";

  const highRiskActions = actions.filter((a) => a.riskLevel === "high");
  const mediumRiskActions = actions.filter((a) => a.riskLevel === "medium");
  const lowRiskActions = actions.filter((a) => a.riskLevel === "low");

  const handleEdit = (action: ActionRecord) => {
    setEditingAction(action);
    setFormOpen(true);
  };

  const handleAdd = () => {
    setEditingAction(null);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingAction(null);
  };

  const handleAddUpdate = (actionId: string, content: string, operator: string) => {
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    addActionUpdate(actionId, {
      id: `up-${Date.now()}`,
      time: timeStr,
      operator,
      content,
    });
  };

  const handleSubmit = (
    data: Omit<ActionRecord, "id" | "createdAt" | "updates" | "relatedOpinionIds">
  ) => {
    if (editingAction) {
      updateAction(editingAction.id, data);
    } else {
      const now = new Date();
      const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

      const newAction: ActionRecord = {
        id: `act-${Date.now()}`,
        createdAt: dateStr,
        updates: [],
        relatedOpinionIds: [],
        ...data,
      };
      addAction(newAction);
      handleCloseForm();
    }
  };

  const handleViewChange = (view: "kanban" | "cross") => {
    setActionsView(view);
  };

  return (
    <div className="h-full flex flex-col min-h-0 max-w-full">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6 flex-shrink-0"
      >
        <div>
          <h1 className="text-2xl font-serif font-bold text-navy-50 mb-1">处置记录</h1>
          <p className="text-navy-200/60 text-sm">跟踪管理舆情应对处置事项</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {actionsView === "kanban" && (
            <button
              onClick={toggleMorningView}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all",
                isMorningView
                  ? "bg-alert-orange/20 text-alert-orange border border-alert-orange/30 shadow-glow-orange"
                  : "bg-navy-700/40 text-navy-100 hover:bg-navy-700/60 border border-navy-700/50"
              )}
            >
              {isMorningView ? (
                <>
                  <Sun className="w-4 h-4" />
                  <span>晨会视图</span>
                </>
              ) : (
                <>
                  <LayoutGrid className="w-4 h-4" />
                  <span>看板视图</span>
                </>
              )}
            </button>
          )}

          {actionsView === "cross" || viewMode === "kanban" ? (
            <div className="flex items-center p-1 bg-navy-800/80 rounded-lg border border-navy-700/50">
              <button
                onClick={() => handleViewChange("kanban")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                  actionsView === "kanban"
                    ? "bg-alert-blue/20 text-alert-blue border border-alert-blue/30 shadow-glow"
                    : "text-navy-200/70 hover:text-white hover:bg-navy-700/50"
                )}
              >
                <LayoutGrid className="w-4 h-4" />
                <span>看板视图</span>
              </button>
              <button
                onClick={() => handleViewChange("cross")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                  actionsView === "cross"
                    ? "bg-alert-blue/20 text-alert-blue border border-alert-blue/30 shadow-glow"
                    : "text-navy-200/70 hover:text-white hover:bg-navy-700/50"
                )}
              >
                <Users className="w-4 h-4" />
                <span>协同视图</span>
              </button>
            </div>
          ) : null}

          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-alert-blue hover:bg-alert-blue/90 text-white font-medium text-sm transition-colors shadow-glow"
          >
            <Plus className="w-4 h-4" />
            <span>新增处置</span>
          </button>
        </div>
      </motion.div>

      <div className="flex-1 min-h-0">
        {viewMode === "cross" ? (
          <CrossDeptView
            actions={actions}
            opinions={opinions}
            onViewChange={handleViewChange}
            onEdit={handleEdit}
          />
        ) : viewMode === "morning" ? (
          <MorningMeetingView actions={actions} onEdit={handleEdit} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0">
            <RiskColumn
              level="high"
              title="高风险"
              colorClass="text-alert-red"
              actions={highRiskActions}
              onEdit={handleEdit}
            />
            <RiskColumn
              level="medium"
              title="中风险"
              colorClass="text-alert-orange"
              actions={mediumRiskActions}
              onEdit={handleEdit}
            />
            <RiskColumn
              level="low"
              title="低风险"
              colorClass="text-alert-green"
              actions={lowRiskActions}
              onEdit={handleEdit}
            />
          </div>
        )}
      </div>

      <ActionForm
        open={formOpen}
        onClose={handleCloseForm}
        initialData={editingAction}
        onSubmit={handleSubmit}
        onAddUpdate={handleAddUpdate}
      />
    </div>
  );
}
