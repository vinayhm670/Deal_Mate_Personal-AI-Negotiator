export type MemoryFactType = 'world' | 'experience' | 'observation' | 'stated_preference';

export interface HindsightMemoryItem {
  id?: string;
  text: string;
  type?: MemoryFactType;
  entities?: string[];
  context?: string;
  timestamp: string;
  confidence?: number;
  metadata?: Record<string, any>;
}

export interface DealDnaProfile {
  userId: string;
  bankId: string;
  preferredBrands: Array<{
    brand: string;
    evidence: string;
    confidence: number;
    timestamp: string;
  }>;
  rejectedBrands: Array<{
    brand: string;
    reason: string;
    evidence: string;
    timestamp: string;
  }>;
  favoriteCategories: string[];
  typicalBudget: {
    min?: number;
    max: number;
    currency: string;
    flexibility: 'Firm' | 'Moderate' | 'Flexible';
    evidence: string;
  };
  criticalFeatures: Array<{
    feature: string;
    priority: 'High' | 'Medium';
    evidence: string;
    timestamp: string;
  }>;
  rejectedProducts: Array<{
    productName: string;
    reason: string;
    evidence: string;
    timestamp: string;
  }>;
  negotiationExperiences: Array<{
    productName: string;
    initialPrice: number;
    finalPrice: number;
    discountPct: number;
    outcome: 'SETTLED' | 'WALKED_AWAY' | 'COUNTERED';
    strategyUsed: string;
    keyLearnings: string;
    timestamp: string;
  }>;
  observedPurchasingPatterns: string[];
  recentlyLearnedPreferences: Array<{
    text: string;
    type: 'explicit' | 'inferred';
    timestamp: string;
  }>;
  lastUpdated: string;
  memoryCount: number;
}

export interface AdaptiveNegotiationStrategy {
  strategyName: string;
  targetDiscountPct: number;
  maxRounds: number;
  firmnessLevel: 'High' | 'Moderate' | 'Flexible';
  tactic: string;
  rationale: string;
  memoryEvidence: string[];
  counterOfferPlan: Array<{
    round: number;
    offerPct: number;
    argument: string;
  }>;
}

export interface HindsightActivityEntry {
  id: string;
  userId: string;
  operation: 'RETAIN' | 'RECALL' | 'REFLECT' | 'HEALTH_CHECK';
  status: 'SUCCESS' | 'FAILED' | 'PENDING' | 'OFFLINE';
  queryOrContent: string;
  resultSummary: string;
  durationMs: number;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface HindsightConnectionStatus {
  connected: boolean;
  status: 'ONLINE' | 'OFFLINE_STANDBY' | 'CONNECTING' | 'ERROR';
  baseUrl: string;
  apiVersion?: string;
  activeBankId?: string;
  totalMemoriesCount: number;
  latencyMs?: number;
  message: string;
  lastChecked: string;
}
