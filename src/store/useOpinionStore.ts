import { create } from 'zustand';
import type {
  BrandConfig,
  OpinionItem,
  TimelineNode,
  SentimentPoint,
  ActionRecord,
  ActionUpdate,
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
} as const;

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

interface OpinionState {
  brandConfig: BrandConfig;
  opinions: OpinionItem[];
  timelineNodes: TimelineNode[];
  sentimentTrend: SentimentPoint[];
  actions: ActionRecord[];
  isMorningView: boolean;
}

interface OpinionActions {
  setBrandConfig: (config: Partial<BrandConfig>) => void;
  addOpinion: (opinion: OpinionItem) => void;
  addAction: (action: ActionRecord) => void;
  updateAction: (actionId: string, updates: Partial<ActionRecord>) => void;
  addActionUpdate: (actionId: string, update: ActionUpdate) => void;
  toggleMorningView: () => void;
}

export type OpinionStore = OpinionState & OpinionActions;

export const useOpinionStore = create<OpinionStore>((set) => ({
  brandConfig: persistedBrandConfig,
  opinions: initialOpinions,
  timelineNodes: initialTimelineNodes,
  sentimentTrend: initialSentimentTrend,
  actions: persistedActions,
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
}));
