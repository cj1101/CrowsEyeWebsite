// API Service - Direct Third-Party Integrations
// This file now re-exports the new unified API service that eliminates the crow's eye API dependency

export * from './unified-api';
export { unifiedAPI as apiService, CrowsEyeAPI, unifiedAPI as default } from './unified-api'; 