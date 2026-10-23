import { QueryClient } from '@tanstack/react-query';

export const appQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

export const QUERY_KEYS = {
  COURSES: ['courses'] as const,
  ASSIGNMENTS: ['assignments'] as const,
  ASSIGNMENT_DETAIL: (id: string) => ['assignment', id] as const,
  OFFLINE_QUEUE: ['offline_queue'] as const,
};
