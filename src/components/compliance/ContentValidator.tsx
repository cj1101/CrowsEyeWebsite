'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useCompliance } from '@/hooks/useCompliance';
import type { ContentValidationResult } from '@/types/compliance';

interface ContentValidatorProps {
  content: string;
  platform: string;
  contentType: 'text' | 'image' | 'video' | 'story';
  mediaUrls?: string[];
  metadata?: Record<string, any>;
  onValidationComplete?: (result: ContentValidationResult) => void;
  autoValidate?: boolean;
  className?: string;
}

const ContentValidator: React.FC<ContentValidatorProps> = ({
  content,
  platform,
  contentType,
  mediaUrls = [],
  metadata = {},
  onValidationComplete,
  autoValidate = true,
  className = ""
}) => {
  const { validating, validateContent, error } = useCompliance();
  const [validationResult, setValidationResult] = useState<ContentValidationResult | null>(null);
  const [hasValidated, setHasValidated] = useState(false);

  const runValidation = useCallback(async () => {
    if (!content.trim() && mediaUrls.length === 0) {
      setValidationResult(null);
      setHasValidated(false);
      return;
    }

    const result = await validateContent({
      content,
      platform,
      content_type: contentType,
      media_urls: mediaUrls,
      metadata
    });

    if (result) {
      setValidationResult(result);
      setHasValidated(true);
      onValidationComplete?.(result);
    }
  }, [content, platform, contentType, mediaUrls, metadata, validateContent, onValidationComplete]);

  useEffect(() => {
    if (autoValidate && (content.trim() || mediaUrls.length > 0)) {
      const timeoutId = setTimeout(runValidation, 500); // Debounce validation
      return () => clearTimeout(timeoutId);
    }
  }, [autoValidate, content, mediaUrls, runValidation]);

  const getValidationIcon = () => {
    if (validating) return <span className="animate-spin">⏳</span>;
    if (!hasValidated) return <span className="text-gray-400">🔍</span>;
    if (validationResult?.is_valid) return <span className="text-green-400">✅</span>;
    return <span className="text-red-400">❌</span>;
  };

  const getValidationStatus = () => {
    if (validating) return 'Validating...';
    if (!hasValidated) return 'Ready to validate';
    if (validationResult?.is_valid) return 'Content approved';
    return 'Content has issues';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500 bg-red-500/10';
      case 'high': return 'text-orange-500 bg-orange-500/10';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10';
      case 'low': return 'text-blue-500 bg-blue-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  if (!hasValidated && !validating && !autoValidate) {
    return (
      <div className={`p-4 bg-gray-800/30 rounded-lg ${className}`}>
        <button
          onClick={runValidation}
          disabled={!content.trim() && mediaUrls.length === 0}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
        >
          <span>🔍</span>
          <span>Validate Content</span>
        </button>
      </div>
    );
  }

  return (
    <div className={`bg-gray-800/30 rounded-lg border border-gray-700 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getValidationIcon()}
            <div>
              <h3 className="text-white font-medium">Content Validation</h3>
              <p className="text-gray-400 text-sm">{getValidationStatus()}</p>
            </div>
          </div>
          {!autoValidate && (
            <button
              onClick={runValidation}
              disabled={validating || (!content.trim() && mediaUrls.length === 0)}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded text-sm transition-colors"
            >
              {validating ? 'Validating...' : 'Revalidate'}
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-500/10 border-l-4 border-red-500">
          <div className="flex items-center space-x-2">
            <span className="text-red-400">⚠️</span>
            <span className="text-red-300 text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Validation Results */}
      {validationResult && (
        <div className="p-4">
          {/* Overall Status */}
          <div className="mb-4">
            <div className={`flex items-center space-x-3 p-3 rounded-lg ${
              validationResult.is_valid 
                ? 'bg-green-500/10 border border-green-500/20' 
                : 'bg-red-500/10 border border-red-500/20'
            }`}>
              <span className={validationResult.is_valid ? 'text-green-400' : 'text-red-400'}>
                {validationResult.is_valid ? '✅' : '❌'}
              </span>
              <div>
                <div className={`font-medium ${validationResult.is_valid ? 'text-green-300' : 'text-red-300'}`}>
                  {validationResult.is_valid ? 'Content Approved' : 'Content Needs Attention'}
                </div>
                <div className="text-gray-400 text-sm">
                  Platform: {validationResult.platform} | Type: {validationResult.content_type}
                </div>
              </div>
            </div>
          </div>

          {/* Violations */}
          {validationResult.violations.length > 0 && (
            <div className="mb-4">
              <h4 className="text-white font-medium mb-3 flex items-center space-x-2">
                <span>⚠️</span>
                <span>Issues Found ({validationResult.violations.length})</span>
              </h4>
              <div className="space-y-2">
                {validationResult.violations.map((violation, index) => (
                  <div key={index} className="p-3 bg-gray-700/30 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <div className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(violation.severity)}`}>
                        {violation.severity.toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="text-white text-sm">{violation.message}</div>
                        {violation.suggestion && (
                          <div className="text-gray-400 text-xs mt-1">
                            💡 {violation.suggestion}
                          </div>
                        )}
                        {violation.location && (
                          <div className="text-gray-500 text-xs mt-1">
                            📍 {violation.location}
                          </div>
                        )}
                      </div>
                      {violation.auto_fixable && (
                        <button className="px-2 py-1 bg-blue-600/20 text-blue-300 text-xs rounded hover:bg-blue-600/30 transition-colors">
                          Auto Fix
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Warnings */}
          {validationResult.warnings.length > 0 && (
            <div className="mb-4">
              <h4 className="text-white font-medium mb-3 flex items-center space-x-2">
                <span>⚠️</span>
                <span>Warnings ({validationResult.warnings.length})</span>
              </h4>
              <div className="space-y-2">
                {validationResult.warnings.map((warning, index) => (
                  <div key={index} className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <div className="text-yellow-300 text-sm">{warning.message}</div>
                    {warning.suggestion && (
                      <div className="text-yellow-400/70 text-xs mt-1">
                        💡 {warning.suggestion}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Auto-fixes */}
          {validationResult.auto_fixes.length > 0 && (
            <div className="mb-4">
              <h4 className="text-white font-medium mb-3 flex items-center space-x-2">
                <span>🔧</span>
                <span>Suggested Fixes ({validationResult.auto_fixes.length})</span>
              </h4>
              <div className="space-y-2">
                {validationResult.auto_fixes.map((fix, index) => (
                  <div key={index} className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-blue-300 text-sm font-medium">{fix.type}</div>
                        <div className="text-gray-400 text-xs">{fix.description}</div>
                        <div className="text-gray-300 text-xs mt-1 font-mono bg-gray-800 p-1 rounded">
                          {fix.preview}
                        </div>
                      </div>
                      <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors">
                        Apply
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Estimated Reach */}
          {validationResult.estimated_reach && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-700/30 p-3 rounded-lg">
                <div className="text-gray-400 text-xs">Potential Audience</div>
                <div className="text-white text-lg font-semibold">
                  {validationResult.estimated_reach.potential_audience.toLocaleString()}
                </div>
              </div>
              <div className="bg-gray-700/30 p-3 rounded-lg">
                <div className="text-gray-400 text-xs">Engagement Prediction</div>
                <div className="text-white text-lg font-semibold">
                  {(validationResult.estimated_reach.engagement_prediction * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ContentValidator; 