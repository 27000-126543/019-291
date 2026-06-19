import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Label,
  ReferenceArea,
} from "recharts";
import { useOpinionStore } from "@/store/useOpinionStore";
import { TrendingUp, TrendingDown, Minus, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const RESPONSE_TIME_POINT = "06-18 18:00";

function getResponseEffectInfo(changePercent: number) {
  const absChange = Math.abs(changePercent);
  if (absChange >= 20) {
    return {
      text: "回应效果显著",
      color: "#52C41A",
      bgColor: "rgba(82, 196, 26, 0.15)",
      borderColor: "rgba(82, 196, 26, 0.3)",
      icon: "🟢",
    };
  } else if (absChange >= 10) {
    return {
      text: "回应有一定效果",
      color: "#FA8C16",
      bgColor: "rgba(250, 140, 22, 0.15)",
      borderColor: "rgba(250, 140, 22, 0.3)",
      icon: "🟡",
    };
  } else {
    return {
      text: "回应效果待观察",
      color: "#FF4D4F",
      bgColor: "rgba(255, 77, 79, 0.15)",
      borderColor: "rgba(255, 77, 79, 0.3)",
      icon: "🔴",
    };
  }
}

export default function SentimentTrendChart() {
  const { sentimentTrend } = useOpinionStore();

  const { chartData, metrics } = useMemo(() => {
    const responseIndex = sentimentTrend.findIndex(
      (item) => item.time === RESPONSE_TIME_POINT
    );

    const beforeData = responseIndex >= 0
      ? sentimentTrend.slice(Math.max(0, responseIndex - 5), responseIndex + 1)
      : sentimentTrend.slice(0, Math.ceil(sentimentTrend.length / 2));

    const afterData = responseIndex >= 0
      ? sentimentTrend.slice(responseIndex)
      : sentimentTrend.slice(Math.ceil(sentimentTrend.length / 2));

    const calcNegativeRatio = (data: typeof sentimentTrend) => {
      if (data.length === 0) return 0;
      const totalNeg = data.reduce((sum, d) => sum + d.negative, 0);
      const totalAll = data.reduce((sum, d) => sum + d.total, 0);
      return totalAll > 0 ? (totalNeg / totalAll) * 100 : 0;
    };

    const beforeRatio = calcNegativeRatio(beforeData);
    const afterRatio = calcNegativeRatio(afterData);
    const changePercent = afterRatio - beforeRatio;

    const data = sentimentTrend.map((item, idx) => ({
      ...item,
      negativeRatio: Number(((item.negative / item.total) * 100).toFixed(1)),
      responseLabel: item.time === RESPONSE_TIME_POINT ? "官方回应" : undefined,
      isBeforeResponse: idx <= responseIndex,
      isAfterResponse: idx >= responseIndex,
    }));

    return {
      chartData: data,
      metrics: {
        beforeRatio,
        afterRatio,
        changePercent,
      },
    };
  }, [sentimentTrend]);

  const hasResponsePoint = chartData.some((d) => d.responseLabel);
  const responseIndex = chartData.findIndex((d) => d.responseLabel);
  const beforeHighlightStart = responseIndex >= 2 ? chartData[responseIndex - 2]?.time : undefined;
  const afterHighlightEnd = responseIndex >= 0 && responseIndex < chartData.length - 2
    ? chartData[responseIndex + 2]?.time
    : undefined;

  const effectInfo = getResponseEffectInfo(metrics.changePercent);

  interface TooltipPayloadEntry {
    name: string;
    value: number;
    color: string;
    dataKey: string;
  }

  interface CustomTooltipProps {
    active?: boolean;
    payload?: TooltipPayloadEntry[];
    label?: string;
  }

  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card p-3 shadow-card border-navy-600/50">
          <p className="text-navy-100 text-sm font-medium mb-2">{label}</p>
          <div className="space-y-1.5">
            {payload.map((entry, index) => (
              <div key={index} className="flex items-center justify-between gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-navy-200/70">{entry.name}</span>
                </div>
                <span className="text-navy-50 font-medium tabular-nums">
                  {entry.dataKey === "negativeRatio"
                    ? `${entry.value}%`
                    : entry.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-alert-green/15 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-alert-green" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-navy-50">情绪变化趋势</h2>
            <p className="text-navy-200/50 text-sm">追踪不同时间段的舆情声量分布</p>
          </div>
        </div>
        <div className="flex items-center gap-5 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-alert-red shadow-glow-red" />
            <span className="text-navy-200/70">负面</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-alert-blue shadow-glow" />
            <span className="text-navy-200/70">中性</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-alert-green shadow-glow-green" />
            <span className="text-navy-200/70">正面</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-0.5 bg-alert-orange border-dashed border-b-2 border-alert-orange" />
            <span className="text-navy-200/70">负面占比</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="glass-card p-4 border-navy-700/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-navy-200/50">回应前24h负面占比</span>
            <div className="w-7 h-7 rounded-lg bg-alert-red/15 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-alert-red" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-alert-red tabular-nums glow-text-red">
              {metrics.beforeRatio.toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <ArrowRight className="w-6 h-6 text-navy-400/50" />
        </div>

        <div className="glass-card p-4 border-navy-700/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-navy-200/50">回应后24h负面占比</span>
            <div className="w-7 h-7 rounded-lg bg-alert-green/15 flex items-center justify-center">
              <TrendingDown className="w-3.5 h-3.5 text-alert-green" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-alert-green tabular-nums glow-text-green">
              {metrics.afterRatio.toFixed(1)}%
            </span>
          </div>
        </div>

        <div
          className="glass-card p-4"
          style={{
            backgroundColor: effectInfo.bgColor,
            borderColor: effectInfo.borderColor,
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-navy-200/70">变化幅度</span>
            <div className="flex items-center gap-1">
              {metrics.changePercent < 0 ? (
                <TrendingDown className="w-3.5 h-3.5" style={{ color: effectInfo.color }} />
              ) : metrics.changePercent > 0 ? (
                <TrendingUp className="w-3.5 h-3.5" style={{ color: effectInfo.color }} />
              ) : (
                <Minus className="w-3.5 h-3.5" style={{ color: effectInfo.color }} />
              )}
            </div>
          </div>
          <div className="flex items-baseline gap-1 mb-1.5">
            <span
              className="text-2xl font-bold tabular-nums"
              style={{ color: effectInfo.color }}
            >
              {metrics.changePercent > 0 ? "↑" : "↓"}
              {Math.abs(metrics.changePercent).toFixed(1)}%
            </span>
          </div>
          <div
            className={cn(
              "text-xs font-medium flex items-center gap-1"
            )}
            style={{ color: effectInfo.color }}
          >
            <span>{effectInfo.icon}</span>
            <span>{effectInfo.text}</span>
          </div>
        </div>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 40, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="negativeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF4D4F" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#FF4D4F" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="neutralGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1890FF" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#1890FF" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="positiveGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#52C41A" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#52C41A" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(100, 139, 197, 0.15)"
              vertical={false}
            />
            <XAxis
              dataKey="time"
              stroke="rgba(100, 139, 197, 0.5)"
              tick={{ fill: "rgba(194, 209, 232, 0.6)", fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: "rgba(100, 139, 197, 0.2)" }}
            />
            <YAxis
              yAxisId="left"
              stroke="rgba(100, 139, 197, 0.5)"
              tick={{ fill: "rgba(194, 209, 232, 0.6)", fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="rgba(250, 140, 22, 0.6)"
              tick={{ fill: "rgba(250, 140, 22, 0.8)", fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: "rgba(250, 140, 22, 0.3)" }}
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip content={<CustomTooltip />} />

            {beforeHighlightStart && hasResponsePoint && (
              <ReferenceArea
                yAxisId="left"
                x1={beforeHighlightStart}
                x2={RESPONSE_TIME_POINT}
                fill="rgba(255, 77, 79, 0.08)"
                strokeOpacity={0.3}
              />
            )}
            {afterHighlightEnd && hasResponsePoint && (
              <ReferenceArea
                yAxisId="left"
                x1={RESPONSE_TIME_POINT}
                x2={afterHighlightEnd}
                fill="rgba(82, 196, 26, 0.08)"
                strokeOpacity={0.3}
              />
            )}

            <Area
              yAxisId="left"
              type="monotone"
              dataKey="negative"
              name="负面"
              stroke="#FF4D4F"
              strokeWidth={2}
              fill="url(#negativeGradient)"
              dot={false}
              activeDot={{ r: 5, fill: "#FF4D4F", stroke: "#0A1628", strokeWidth: 2 }}
            />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="neutral"
              name="中性"
              stroke="#1890FF"
              strokeWidth={2}
              fill="url(#neutralGradient)"
              dot={false}
              activeDot={{ r: 5, fill: "#1890FF", stroke: "#0A1628", strokeWidth: 2 }}
            />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="positive"
              name="正面"
              stroke="#52C41A"
              strokeWidth={2}
              fill="url(#positiveGradient)"
              dot={false}
              activeDot={{ r: 5, fill: "#52C41A", stroke: "#0A1628", strokeWidth: 2 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="negativeRatio"
              name="负面占比"
              stroke="#FA8C16"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              activeDot={{ r: 5, fill: "#FA8C16", stroke: "#0A1628", strokeWidth: 2 }}
            />
            {hasResponsePoint && (
              <ReferenceLine
                yAxisId="left"
                x={RESPONSE_TIME_POINT}
                stroke="#52C41A"
                strokeWidth={2}
                strokeDasharray="4 4"
              >
                <Label
                  value="官方回应"
                  position="top"
                  fill="#52C41A"
                  fontSize={12}
                  fontWeight={600}
                />
              </ReferenceLine>
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
