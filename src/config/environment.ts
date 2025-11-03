export const environment = {
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  },
  websocket: {
    url: import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:8080/notifications',
  },
} as const;

export type Environment = typeof environment;
