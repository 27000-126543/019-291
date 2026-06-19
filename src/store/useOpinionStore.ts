import { create } from 'zustand';
import type {
  BrandConfig,
  OpinionItem,
  TimelineNode,
  SentimentPoint,
  ActionRecord,
  ActionUpdate,
  AlertRule,
} from '@/types';
import {
  initialBrandConfig,
  initialOpinions,
  initialTimelineNodes,
  initialSentimentTrend,
  initialActions,
} from '@/data';

const STORAGE_KEYS = {
  BRAND_CONFIG: 'opinion_dashboard:brandConfig',
  ACTIONS: 'opinion_dashboard:actions',
  ALERT_RULES: 'opinion_dashboard:alertRules',
} as const;

const defaultAlertRules: AlertRule[] = [
  {
    id: 'alert_negative_ratio',
    name: '负面占比预警',
    type: 'negative_ratio',
    enabled: true,
    threshold: 50,
    unit: '%',
    description: '负面占比超过50%',
  },
  {
    id: 'alert_platform_spike',
    name: '单平台声量预警',
    type: 'platform_spike',
    enabled: true,
    threshold: 5000,
    unit: '条',
    description: '单平台24h声量超过5000',
  },
  {
    id: 'alert_competitor_trending',
    name: '竞品热搜预警',
    type: 'competitor_trending',
    enabled: true,
    threshold: 1,
    unit: '次',
    description: '竞品被一起带上热搜',
  },
];

function safeGetStorage<T>(key: string, defaultValue: T): T {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return defaultValue;
    }
    const raw = window.localStorage.getItem(key);
    if (raw === null) {
      return defaultValue;
    }
    return JSON.parse(raw) as T;
  } catch {
    return defaultValue;
  }
}

function safeSetStorage<T>(key: string, value: T): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

const persistedBrandConfig = safeGetStorage<BrandConfig>(
  STORAGE_KEYS.BRAND_CONFIG,
  initialBrandConfig
);
const persistedActions = safeGetStorage<ActionRecord[]>(
  STORAGE_KEYS.ACTIONS,
  initialActions
);
const persistedAlertRules = safeGetStorage<AlertRule[]>(
  STORAGE_KEYS.ALERT_RULES,
  defaultAlertRules
);

interface OpinionState {
  brandConfig: BrandConfig;
  opinions: OpinionItem[];
  timelineNodes: TimelineNode[];
  sentimentTrend: SentimentPoint[];
  actions: ActionRecord[];
  alertRules: AlertRule[];
  isMorningView: boolean;
}

interface OpinionActions {
  setBrandConfig: (config: Partial<BrandConfig>) => void;
  addOpinion: (opinion: OpinionItem) => void;
  addAction: (action: ActionRecord) => void;
  updateAction: (actionId: string, updates: Partial<ActionRecord>) => void;
  addActionUpdate: (actionId: string, update: ActionUpdate) => void;
  toggleMorningView: () => void;
  setAlertRules: (rules: AlertRule[]) => void;
  toggleAlertRule: (ruleId: string) => void;
  updateAlertRule: (ruleId: string, updates: Partial<AlertRule>) => void;
}

export type OpinionStore = OpinionState & OpinionActions;

export const useOpinionStore = create<OpinionStore>((set) => ({
  brandConfig: persistedBrandConfig,
  opinions: initialOpinions,
  timelineNodes: initialTimelineNodes,
  sentimentTrend: initialSentimentTrend,
  actions: persistedActions,
  alertRules: persistedAlertRules,
  isMorningView: false,

  setBrandConfig: (config) =>
    set((state) => {
      const newBrandConfig = { ...state.brandConfig, ...config };
      safeSetStorage(STORAGE_KEYS.BRAND_CONFIG, newBrandConfig);
      return { brandConfig: newBrandConfig };
    }),

  addOpinion: (opinion) =>
    set((state) => ({ opinions: [opinion, ...state.opinions] })),

  addAction: (action) =>
    set((state) => {
      const newActions = [action, ...state.actions];
      safeSetStorage(STORAGE_KEYS.ACTIONS, newActions);
      return { actions: newActions };
    }),

  updateAction: (actionId, updates) =>
    set((state) => {
      const newActions = state.actions.map((action) =>
        action.id === actionId ? { ...action, ...updates } : action
      );
      safeSetStorage(STORAGE_KEYS.ACTIONS, newActions);
      return { actions: newActions };
    }),

  addActionUpdate: (actionId, update) =>
    set((state) => {
      const newActions = state.actions.map((action) =>
        action.id === actionId
          ? { ...action, updates: [...action.updates, update] }
          : action
      );
      safeSetStorage(STORAGE_KEYS.ACTIONS, newActions);
      return { actions: newActions };
    }),

  toggleMorningView: () =>
    set((state) => ({ isMorningView: !state.isMorningView })),

  setAlertRules: (rules) =>
    set(() => {
      safeSetStorage(STORAGE_KEYS.ALERT_RULES, rules);
      return { alertRules: rules };
    }),

  toggleAlertRule: (ruleId) =>
    set((state) => {
      const newRules = state.alertRules.map((rule) =>
        rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
      );
      safeSetStorage(STORAGE_KEYS.ALERT_RULES, newRules);
      return { alertRules: newRules };
    }),

  updateAlertRule: (ruleId, updates) =>
    set((state) => {
      const newRules = state.alertRules.map((rule) =>
        rule.id === ruleId ? { ...rule, ...updates } : rule
      );
      safeSetStorage(STORAGE_KEYS.ALERT_RULES, newRules);
      return { alertRules: newRules };
    }),
}));
