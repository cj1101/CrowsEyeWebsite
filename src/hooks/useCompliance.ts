'use client';

import { useState, useCallback } from 'react';
import { apiService } from '@/services/api';
import type {
  ComplianceAuditResult,
  PlatformRequirements,
  PlatformsSummary,
  RateLimitInfo,
  ContentValidationResult,
  ComplianceHealthCheck,
  AuthenticationRequirement,
  ContentPolicy,
  PrivacyRequirement
} from '@/types/compliance';

interface UseComplianceReturn {
  // Loading states
  loading: boolean;
  validating: boolean;
  
  // Data
  auditResult: ComplianceAuditResult | null;
  platformsSummary: PlatformsSummary | null;
  rateLimits: RateLimitInfo[] | null;
  healthCheck: ComplianceHealthCheck | null;
  
  // Error handling
  error: string | null;
  
  // Methods
  runComprehensiveAudit: () => Promise<ComplianceAuditResult | null>;
  getPlatformRequirements: (platformId: string) => Promise<PlatformRequirements | null>;
  loadPlatformsSummary: () => Promise<PlatformsSummary | null>;
  loadRateLimits: () => Promise<RateLimitInfo[] | null>;
  validateContent: (data: {
    content: string;
    platform: string;
    content_type: 'text' | 'image' | 'video' | 'story';
    media_urls?: string[];
    metadata?: Record<string, any>;
  }) => Promise<ContentValidationResult | null>;
  checkHealth: () => Promise<ComplianceHealthCheck | null>;
  getAuthRequirements: () => Promise<AuthenticationRequirement[] | null>;
  getContentPolicies: () => Promise<ContentPolicy[] | null>;
  getPrivacyRequirements: () => Promise<PrivacyRequirement[] | null>;
  clearError: () => void;
}

export const useCompliance = (): UseComplianceReturn => {
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Data states
  const [auditResult, setAuditResult] = useState<ComplianceAuditResult | null>(null);
  const [platformsSummary, setPlatformsSummary] = useState<PlatformsSummary | null>(null);
  const [rateLimits, setRateLimits] = useState<RateLimitInfo[] | null>(null);
  const [healthCheck, setHealthCheck] = useState<ComplianceHealthCheck | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleError = useCallback((error: any, operation: string) => {
    console.error(`Compliance ${operation} failed:`, error);
    const message = error.response?.data?.detail || error.message || `${operation} failed`;
    setError(message);
  }, []);

  const runComprehensiveAudit = useCallback(async (): Promise<ComplianceAuditResult | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.comprehensiveComplianceCheck();
      const result = response.data as ComplianceAuditResult;
      
      setAuditResult(result);
      return result;
    } catch (error) {
      handleError(error, 'comprehensive audit');
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const getPlatformRequirements = useCallback(async (platformId: string): Promise<PlatformRequirements | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getPlatformRequirements(platformId);
      return response.data as PlatformRequirements;
    } catch (error) {
      handleError(error, 'platform requirements');
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const loadPlatformsSummary = useCallback(async (): Promise<PlatformsSummary | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getPlatformsSummary();
      const summary = response.data as PlatformsSummary;
      
      setPlatformsSummary(summary);
      return summary;
    } catch (error) {
      handleError(error, 'platforms summary');
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const loadRateLimits = useCallback(async (): Promise<RateLimitInfo[] | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getRateLimits();
      const limits = response.data as RateLimitInfo[];
      
      setRateLimits(limits);
      return limits;
    } catch (error) {
      handleError(error, 'rate limits');
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const validateContent = useCallback(async (data: {
    content: string;
    platform: string;
    content_type: 'text' | 'image' | 'video' | 'story';
    media_urls?: string[];
    metadata?: Record<string, any>;
  }): Promise<ContentValidationResult | null> => {
    try {
      setValidating(true);
      setError(null);
      
      const response = await apiService.validateContent(data);
      return response.data as ContentValidationResult;
    } catch (error) {
      handleError(error, 'content validation');
      return null;
    } finally {
      setValidating(false);
    }
  }, [handleError]);

  const checkHealth = useCallback(async (): Promise<ComplianceHealthCheck | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.complianceHealthCheck();
      const health = response.data as ComplianceHealthCheck;
      
      setHealthCheck(health);
      return health;
    } catch (error) {
      handleError(error, 'health check');
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const getAuthRequirements = useCallback(async (): Promise<AuthenticationRequirement[] | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getAuthRequirements();
      return response.data as AuthenticationRequirement[];
    } catch (error) {
      handleError(error, 'authentication requirements');
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const getContentPolicies = useCallback(async (): Promise<ContentPolicy[] | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getContentPolicies();
      return response.data as ContentPolicy[];
    } catch (error) {
      handleError(error, 'content policies');
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const getPrivacyRequirements = useCallback(async (): Promise<PrivacyRequirement[] | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getPrivacyRequirements();
      return response.data as PrivacyRequirement[];
    } catch (error) {
      handleError(error, 'privacy requirements');
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  return {
    // Loading states
    loading,
    validating,
    
    // Data
    auditResult,
    platformsSummary,
    rateLimits,
    healthCheck,
    
    // Error handling
    error,
    
    // Methods
    runComprehensiveAudit,
    getPlatformRequirements,
    loadPlatformsSummary,
    loadRateLimits,
    validateContent,
    checkHealth,
    getAuthRequirements,
    getContentPolicies,
    getPrivacyRequirements,
    clearError,
  };
}; 