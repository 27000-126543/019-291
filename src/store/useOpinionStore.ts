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
  brandConfig: initialBrandConfig,
  opinions: initialOpinions,
  timelineNodes: initialTimelineNodes,
  sentimentTrend: initialSentimentTrend,
  actions: initialActions,
  isMorningView: false,

  setBrandConfig: (config) =>
    set((state) => ({
      brandConfig: { ...state.brandConfig, ...config },
    })),

  addOpinion: (opinion) =>
    set((state) => ({ opinions: [opinion, ...state.opinions] })),

  addAction: (action) =>
    set((state) => ({ actions: [action, ...state.actions] })),

  updateAction: (actionId, updates) =>
    set((state) => ({
      actions: state.actions.map((action) =>
        action.id === actionId ? { ...action, ...updates } : action
      ),
    })),

  addActionUpdate: (actionId, update) =>
    set((state) => ({
      actions: state.actions.map((action) =>
        action.id === actionId
          ? { ...action, updates: [...action.updates, update] }
          : action
      ),
    })),

  toggleMorningView: () =>
    set((state) => ({ isMorningView: !state.isMorningView })),
}));
