import { useAppStore } from './useAppStore';
import { useSessionStore } from './useSessionStore';

// Session selectors
export const selectUser = (state: ReturnType<typeof useSessionStore.getState>) => state.user;
export const selectIsAuthenticated = (state: ReturnType<typeof useSessionStore.getState>) => state.isAuthenticated;
export const selectIsRestoring = (state: ReturnType<typeof useSessionStore.getState>) => state.isRestoring;

// App filter selectors
export const selectSelectedCourseId = (state: ReturnType<typeof useAppStore.getState>) => state.selectedCourseId;
export const selectSelectedStatus = (state: ReturnType<typeof useAppStore.getState>) => state.selectedStatus;
export const selectSearchQuery = (state: ReturnType<typeof useAppStore.getState>) => state.searchQuery;
export const selectViewMode = (state: ReturnType<typeof useAppStore.getState>) => state.viewMode;

// Simulator selectors
export const selectIsSimulatedOffline = (state: ReturnType<typeof useAppStore.getState>) => state.isSimulatedOffline;
export const selectIsSimulatedError = (state: ReturnType<typeof useAppStore.getState>) => state.isSimulatedError;
export const selectPendingSyncCount = (state: ReturnType<typeof useAppStore.getState>) => state.pendingSyncCount;
