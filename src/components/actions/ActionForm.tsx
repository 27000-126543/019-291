import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle } from "lucide-react";
import type { ActionRecord } from "@/types";
import { cn } from "@/lib/utils";

interface ActionFormProps {
  open: boolean;
  onClose: () => void;
  initialData?: ActionRecord | null;
  onSubmit: (data: Omit<ActionRecord, "id" | "createdAt" | "updates" | "relatedOpinionIds">) => void;
}

interface FormData {
  title: string;
  description: string;
  riskLevel: "high" | "medium" | "low";
  department: "pr" | "legal" | "cs" | "qa";
  status: "pending" | "in_progress" | "done";
  owner: string;
  deadline: string;
}

const defaultFormData: FormData = {
  title: "",
  description: "",
  riskLevel: "medium",
  department: "pr",
  status: "pending",
  owner: "",
  deadline: "",
};

const RISK_OPTIONS = [
  { value: "high", label: "高风险", color: "text-alert-red", bg: "bg-alert-red/15 border-alert-red/40" },
  { value: "medium", label: "中风险", color: "text-alert-orange", bg: "bg-alert-orange/15 border-alert-orange/40" },
  { value: "low", label: "低风险", color: "text-alert-green", bg: "bg-alert-green/15 border-alert-green/40" },
];

const DEPARTMENT_OPTIONS = [
  { value: "pr", label: "公关" },
  { value: "legal", label: "法务" },
  { value: "cs", label: "客服" },
  { value: "qa", label: "质量" },
];

const STATUS_OPTIONS = [
  { value: "pending", label: "待处理" },
  { value: "in_progress", label: "进行中" },
  { value: "done", label: "已完成" },
];

export default function ActionForm({ open, onClose, initialData, onSubmit }: ActionFormProps) {
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        description: initialData.description,
        riskLevel: initialData.riskLevel,
        department: initialData.department,
        status: initialData.status,
        owner: initialData.owner,
        deadline: initialData.deadline,
      });
    } else {
      setFormData(defaultFormData);
    }
    setErrors({});
  }, [initialData, open]);

  const validate = () => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    if (!formData.title.trim()) newErrors.title = "请输入标题";
    if (!formData.description.trim()) newErrors.description = "请输入描述";
    if (!formData.owner.trim()) newErrors.owner = "请输入负责人";
    if (!formData.deadline.trim()) newErrors.deadline = "请选择截止时间";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(formData);
    onClose();
  };

  const handleChange = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-navy-950/70 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-2xl mx-auto"
          >
            <div className="glass-card overflow-hidden shadow-glow">
              <div className="flex items-center justify-between px-6 py-4 border-b border-navy-700/50">
                <h3 className="text-xl font-semibold text-navy-50">
                  {initialData ? "编辑处置项" : "新增处置项"}
                </h3>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg text-navy-200/60 hover:text-white hover:bg-navy-700/50 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 max-h-[70vh] overflow-y-auto">
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-navy-100 mb-1.5">
                      标题 <span className="text-alert-red">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleChange("title", e.target.value)}
                      placeholder="请输入处置项标题"
                      className={cn(
                        "w-full px-4 py-2.5 rounded-lg bg-navy-900/60 border text-navy-50 placeholder:text-navy-200/40",
                        "focus:outline-none focus:ring-2 focus:ring-alert-blue/40 transition-all",
                        errors.title ? "border-alert-red/50" : "border-navy-700/50"
                      )}
                    />
                    {errors.title && (
                      <p className="mt-1 text-xs text-alert-red flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.title}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy-100 mb-1.5">
                      描述 <span className="text-alert-red">*</span>
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleChange("description", e.target.value)}
                      placeholder="请输入详细描述"
                      rows={3}
                      className={cn(
                        "w-full px-4 py-2.5 rounded-lg bg-navy-900/60 border text-navy-50 placeholder:text-navy-200/40 resize-none",
                        "focus:outline-none focus:ring-2 focus:ring-alert-blue/40 transition-all",
                        errors.description ? "border-alert-red/50" : "border-navy-700/50"
                      )}
                    />
                    {errors.description && (
                      <p className="mt-1 text-xs text-alert-red flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.description}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-navy-100 mb-1.5">
                        风险等级
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {RISK_OPTIONS.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => handleChange("riskLevel", option.value as FormData["riskLevel"])}
                            className={cn(
                              "px-2 py-2 rounded-lg text-sm font-medium border transition-all",
                              formData.riskLevel === option.value
                                ? option.bg
                                : "bg-navy-900/40 border-navy-700/40 text-navy-200/60 hover:text-navy-100"
                            )}
                          >
                            <span className={formData.riskLevel === option.value ? option.color : ""}>
                              {option.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-navy-100 mb-1.5">
                        负责部门
                      </label>
                      <select
                        value={formData.department}
                        onChange={(e) => handleChange("department", e.target.value as FormData["department"])}
                        className="w-full px-4 py-2.5 rounded-lg bg-navy-900/60 border border-navy-700/50 text-navy-50 focus:outline-none focus:ring-2 focus:ring-alert-blue/40 transition-all"
                      >
                        {DEPARTMENT_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-navy-100 mb-1.5">
                        状态
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {STATUS_OPTIONS.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => handleChange("status", option.value as FormData["status"])}
                            className={cn(
                              "px-2 py-2 rounded-lg text-sm font-medium border transition-all",
                              formData.status === option.value
                                ? "bg-alert-blue/15 border-alert-blue/40 text-alert-blue"
                                : "bg-navy-900/40 border-navy-700/40 text-navy-200/60 hover:text-navy-100"
                            )}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-navy-100 mb-1.5">
                        负责人 <span className="text-alert-red">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.owner}
                        onChange={(e) => handleChange("owner", e.target.value)}
                        placeholder="请输入负责人姓名"
                        className={cn(
                          "w-full px-4 py-2.5 rounded-lg bg-navy-900/60 border text-navy-50 placeholder:text-navy-200/40",
                          "focus:outline-none focus:ring-2 focus:ring-alert-blue/40 transition-all",
                          errors.owner ? "border-alert-red/50" : "border-navy-700/50"
                        )}
                      />
                      {errors.owner && (
                        <p className="mt-1 text-xs text-alert-red flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.owner}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy-100 mb-1.5">
                      截止时间 <span className="text-alert-red">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.deadline}
                      onChange={(e) => handleChange("deadline", e.target.value)}
                      placeholder="例：2026-06-20 18:00"
                      className={cn(
                        "w-full px-4 py-2.5 rounded-lg bg-navy-900/60 border text-navy-50 placeholder:text-navy-200/40",
                        "focus:outline-none focus:ring-2 focus:ring-alert-blue/40 transition-all",
                        errors.deadline ? "border-alert-red/50" : "border-navy-700/50"
                      )}
                    />
                    {errors.deadline && (
                      <p className="mt-1 text-xs text-alert-red flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.deadline}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 mt-8 pt-5 border-t border-navy-700/40">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-lg text-navy-100 bg-navy-700/40 hover:bg-navy-700/60 transition-colors font-medium"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-lg text-white bg-alert-blue hover:bg-alert-blue/90 transition-colors font-medium shadow-glow"
                  >
                    保存
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
