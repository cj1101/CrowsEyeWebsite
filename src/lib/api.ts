// Re-export the unified API service from the services directory
// This eliminates dependency on the crow's eye API backend
export { apiService, unifiedAPI } from '@/services/api';
export * from '@/services/api'; 