import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, X, Plus, Save, Settings } from "lucide-react";
import { useOpinionStore } from "@/store/useOpinionStore";
import type { BrandConfig } from "@/types";
import { cn } from "@/lib/utils";

type FieldKey = "productModels" | "batchNumbers" | "recallKeywords" | "competitors";

const FIELD_LABELS: Record<FieldKey, string> = {
  productModels: "产品型号",
  batchNumbers: "批次号",
  recallKeywords: "召回关键词",
  competitors: "竞品名称",
};

export default function BrandConfigPanel() {
  const { brandConfig, setBrandConfig } = useOpinionStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [localConfig, setLocalConfig] = useState<BrandConfig>(brandConfig);
  const [inputValues, setInputValues] = useState<Record<FieldKey, string>>({
    productModels: "",
    batchNumbers: "",
    recallKeywords: "",
    competitors: "",
  });

  const handleSave = () => {
    setBrandConfig(localConfig);
    setIsExpanded(false);
  };

  const handleAddItem = (field: FieldKey) => {
    const value = inputValues[field].trim();
    if (value && !localConfig[field].includes(value)) {
      setLocalConfig({
        ...localConfig,
        [field]: [...localConfig[field], value],
      });
      setInputValues({ ...inputValues, [field]: "" });
    }
  };

  const handleRemoveItem = (field: FieldKey, index: number) => {
    setLocalConfig({
      ...localConfig,
      [field]: localConfig[field].filter((_, i) => i !== index),
    });
  };

  const handleKeyDown = (field: FieldKey, e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddItem(field);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card mb-6 overflow-hidden"
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-navy-700/20 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-alert-blue/10 flex items-center justify-center">
            <Settings className="w-5 h-5 text-alert-blue" />
          </div>
          <div className="text-left">
            <h3 className="text-navy-100 font-semibold">品牌配置</h3>
            <p className="text-navy-200/50 text-sm">
              {brandConfig.brandName} · {brandConfig.productModels.length} 个型号 ·{" "}
              {brandConfig.competitors.length} 个竞品
            </p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-navy-200/50"
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-2 border-t border-navy-700/30">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-navy-200/70 text-sm mb-2">品牌名称</label>
                  <input
                    type="text"
                    value={localConfig.brandName}
                    onChange={(e) =>
                      setLocalConfig({ ...localConfig, brandName: e.target.value })
                    }
                    className="w-full bg-navy-900/60 border border-navy-700/50 rounded-md px-3 py-2 text-navy-100 placeholder-navy-200/30 focus:outline-none focus:border-alert-blue/50 transition-colors"
                    placeholder="请输入品牌名称"
                  />
                </div>

                {(Object.keys(FIELD_LABELS) as FieldKey[]).map((field) => (
                  <div key={field}>
                    <label className="block text-navy-200/70 text-sm mb-2">
                      {FIELD_LABELS[field]}
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={inputValues[field]}
                        onChange={(e) =>
                          setInputValues({ ...inputValues, [field]: e.target.value })
                        }
                        onKeyDown={(e) => handleKeyDown(field, e)}
                        className="flex-1 bg-navy-900/60 border border-navy-700/50 rounded-md px-3 py-2 text-navy-100 placeholder-navy-200/30 focus:outline-none focus:border-alert-blue/50 transition-colors"
                        placeholder={`输入后回车或点击添加`}
                      />
                      <button
                        onClick={() => handleAddItem(field)}
                        className="px-3 py-2 bg-navy-700/40 hover:bg-navy-600/40 text-navy-100 rounded-md transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 min-h-[32px]">
                      {localConfig[field].map((item, idx) => (
                        <motion.span
                          key={idx}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className={cn(
                            "inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-sm",
                            field === "recallKeywords"
                              ? "bg-alert-red/10 text-alert-red"
                              : field === "competitors"
                              ? "bg-alert-orange/10 text-alert-orange"
                              : "bg-alert-blue/10 text-alert-blue"
                          )}
                        >
                          {item}
                          <button
                            onClick={() => handleRemoveItem(field, idx)}
                            className="hover:text-white transition-colors ml-1"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </motion.span>
                      ))}
                      {localConfig[field].length === 0 && (
                        <span className="text-navy-200/30 text-sm py-1">暂未添加</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setLocalConfig(brandConfig);
                    setIsExpanded(false);
                  }}
                  className="px-4 py-2 text-navy-200/70 hover:text-navy-100 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-5 py-2 bg-alert-blue hover:bg-alert-blue/90 text-white rounded-md transition-colors"
                >
                  <Save className="w-4 h-4" />
                  保存配置
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
