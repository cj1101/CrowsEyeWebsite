// Compliance Types for Crow's Eye Marketing Suite

export interface ComplianceRule {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'content' | 'privacy' | 'rate_limit' | 'authentication' | 'formatting';
  platform: string;
  requirement: string;
  example?: string;
  documentation_url?: string;
}

export interface ComplianceViolation {
  rule_id: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  location?: string;
  suggestion?: string;
  auto_fixable: boolean;
}

export interface ComplianceAuditResult {
  overall_status: 'compliant' | 'partial' | 'non_compliant';
  score: number; // 0-100
  total_checks: number;
  passed_checks: number;
  failed_checks: number;
  violations: ComplianceViolation[];
  recommendations: string[];
  last_updated: string;
}

export interface PlatformRequirements {
  platform: string;
  platform_name: string;
  authentication: {
    required: boolean;
    methods: string[];
    scopes: string[];
    refresh_required: boolean;
  };
  content_limits: {
    text_max_length: number;
    hashtags_max_count: number;
    media_max_count: number;
    video_max_duration: number;
    file_size_limits: Record<string, number>;
  };
  rate_limits: {
    posts_per_hour: number;
    posts_per_day: number;
    api_calls_per_minute: number;
    api_calls_per_hour: number;
  };
  content_policies: ComplianceRule[];
  supported_formats: {
    images: string[];
    videos: string[];
    audio: string[];
  };
}

export interface PlatformsSummary {
  platforms: Array<{
    platform: string;
    status: 'connected' | 'disconnected' | 'error';
    compliance_score: number;
    last_check: string;
    issues_count: number;
    warnings_count: number;
  }>;
  overall_compliance: number;
  last_updated: string;
}

export interface RateLimitInfo {
  platform: string;
  current_usage: {
    posts_today: number;
    posts_this_hour: number;
    api_calls_this_minute: number;
    api_calls_this_hour: number;
  };
  limits: {
    posts_per_hour: number;
    posts_per_day: number;
    api_calls_per_minute: number;
    api_calls_per_hour: number;
  };
  remaining: {
    posts_today: number;
    posts_this_hour: number;
    api_calls_this_minute: number;
    api_calls_this_hour: number;
  };
  reset_times: {
    hourly_reset: string;
    daily_reset: string;
    minute_reset: string;
  };
  status: 'ok' | 'warning' | 'limited';
}

export interface ContentValidationResult {
  is_valid: boolean;
  platform: string;
  content_type: string;
  violations: ComplianceViolation[];
  warnings: Array<{
    message: string;
    suggestion?: string;
  }>;
  auto_fixes: Array<{
    type: string;
    description: string;
    preview: string;
  }>;
  estimated_reach: {
    potential_audience: number;
    engagement_prediction: number;
  };
}

export interface ComplianceHealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  services: Array<{
    name: string;
    status: 'up' | 'down' | 'degraded';
    response_time: number;
    last_check: string;
  }>;
  platform_connections: Array<{
    platform: string;
    status: 'connected' | 'disconnected' | 'error';
    last_successful_call: string;
    error_count_24h: number;
  }>;
  compliance_database: {
    last_updated: string;
    rules_count: number;
    platforms_covered: number;
  };
}

export interface AuthenticationRequirement {
  platform: string;
  required_scopes: string[];
  oauth_flow: 'authorization_code' | 'implicit' | 'client_credentials';
  refresh_token_required: boolean;
  token_lifetime: number; // in seconds
  additional_requirements: string[];
  setup_guide_url: string;
}

export interface ContentPolicy {
  platform: string;
  category: 'prohibited_content' | 'restricted_content' | 'community_guidelines' | 'advertising_policies';
  rules: ComplianceRule[];
  enforcement_level: 'strict' | 'moderate' | 'lenient';
  last_updated: string;
}

export interface PrivacyRequirement {
  platform: string;
  gdpr_compliance: boolean;
  ccpa_compliance: boolean;
  data_retention_days: number;
  user_consent_required: boolean;
  data_types_collected: string[];
  third_party_sharing: boolean;
  privacy_policy_url: string;
  user_rights: string[];
} 