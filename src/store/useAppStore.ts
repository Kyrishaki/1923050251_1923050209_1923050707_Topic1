import { create } from 'zustand';
import { getOfflineQueue } from '../services/asyncStorage';
import {
  setSimulatedApiError,
  setSimulatedOffline,
} from '../services/mockApi';
import { AssignmentStatus } from '../types';

export type FilterStatus = 'all' | AssignmentStatus;
export type ViewMode = 'list' | 'weekly';

interface AppState {
  // Filters
  selectedCourseId: string; // 'all' or courseId
  selectedStatus: FilterStatus;
  searchQuery: string;
  viewMode: ViewMode;

  // Simulator controls
  isSimulatedOffline: boolean;
  isSimulatedError: boolean;
  pendingSyncCount: number;

  // Actions
  setSelectedCourseId: (courseId: string) => void;
  setSelectedStatus: (status: FilterStatus) => void;
  setSearchQuery: (query: string) => void;
  setViewMode: (mode: ViewMode) => void;
  resetFilters: () => void;

  toggleSimulatedOffline: () => void;
  toggleSimulatedError: () => void;
  refreshPendingSyncCount: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  selectedCourseId: 'all',
  selectedStatus: 'all',
  searchQuery: '',
  viewMode: 'list',

  isSimulatedOffline: false,
  isSimulatedError: false,
  pendingSyncCount: 0,

  setSelectedCourseId: (courseId) => set({ selectedCourseId: courseId }),
  setSelectedStatus: (status) => set({ selectedStatus: status }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setViewMode: (viewMode) => set({ viewMode }),
  resetFilters: () =>
    set({
      selectedCourseId: 'all',
      selectedStatus: 'all',
      searchQuery: '',
    }),

  toggleSimulatedOffline: () => {
    const next = !get().isSimulatedOffline;
    setSimulatedOffline(next);
    set({ isSimulatedOffline: next });
    get().refreshPendingSyncCount();
  },

  toggleSimulatedError: () => {
    const next = !get().isSimulatedError;
    setSimulatedApiError(next);
    set({ isSimulatedError: next });
  },

  refreshPendingSyncCount: async () => {
    const queue = await getOfflineQueue();
    set({ pendingSyncCount: queue.length });
  },
}));
