import { getAuthHeaders, getActiveSessionToken } from './authHeaders';
import type {
  DealDnaProfile,
  HindsightActivityEntry,
  HindsightConnectionStatus,
  HindsightMemoryItem,
  AdaptiveNegotiationStrategy,
} from '../types/hindsight';

/**
 * DealMate Hindsight Client Service
 *
 * Safe client-side wrapper communicating with server-side Hindsight memory endpoints.
 * Automatically attaches auth tokens, isolates user memory banks, handles timeouts,
 * and maintains transparent status reporting.
 */
class HindsightClientService {
  private activeStatus: HindsightConnectionStatus = {
    connected: false,
    status: 'CONNECTING',
    baseUrl: 'http://127.0.0.1:8888',
    totalMemoriesCount: 0,
    message: 'Checking Hindsight agent memory connection...',
    lastChecked: new Date().toISOString(),
  };

  private statusListeners: Set<(status: HindsightConnectionStatus) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      // Periodic health check
      this.checkHealth();
      setInterval(() => this.checkHealth(), 20000);
    }
  }

  public subscribeStatus(listener: (status: HindsightConnectionStatus) => void) {
    this.statusListeners.add(listener);
    listener(this.activeStatus);
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  private notifyStatus(status: HindsightConnectionStatus) {
    this.activeStatus = status;
    this.statusListeners.forEach((cb) => cb(status));
  }

  public getStatus(): HindsightConnectionStatus {
    return this.activeStatus;
  }

  /**
   * Health check for Hindsight engine
   */
  public async checkHealth(): Promise<HindsightConnectionStatus> {
    try {
      const res = await fetch('/api/hindsight/status', {
        headers: {
          ...getAuthHeaders(),
        },
      });

      if (!res.ok) {
        throw new Error(`Status check returned ${res.status}`);
      }

      const data: HindsightConnectionStatus = await res.json();
      this.notifyStatus(data);
      return data;
    } catch (err: any) {
      const fallback: HindsightConnectionStatus = {
        connected: false,
        status: 'OFFLINE_STANDBY',
        baseUrl: 'http://127.0.0.1:8888',
        totalMemoriesCount: 0,
        message: `Hindsight server check failed: ${err?.message || 'Network error'}`,
        lastChecked: new Date().toISOString(),
      };
      this.notifyStatus(fallback);
      return fallback;
    }
  }

  /**
   * RETAIN: Store a verified user shopping preference, brand like/dislike, or negotiation outcome
   */
  public async retain(
    content: string,
    options?: {
      context?: string;
      metadata?: Record<string, string>;
      documentId?: string;
    }
  ): Promise<{ success: boolean; bankId?: string; message: string; error?: string }> {
    try {
      const res = await fetch('/api/hindsight/retain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          content,
          context: options?.context,
          metadata: options?.metadata,
          documentId: options?.documentId,
        }),
      });

      const data = await res.json();
      if (data.success) {
        this.checkHealth();
      }
      return data;
    } catch (err: any) {
      return {
        success: false,
        message: 'Failed to contact DealMate Hindsight server',
        error: err?.message,
      };
    }
  }

  /**
   * RECALL: Retrieve relevant user memories for personalizing shopping or negotiation
   */
  public async recall(
    query: string,
    options?: {
      budget?: 'low' | 'mid' | 'high';
      maxTokens?: number;
    }
  ): Promise<{
    success: boolean;
    memories: HindsightMemoryItem[];
    bankId?: string;
    message: string;
    error?: string;
  }> {
    try {
      const res = await fetch('/api/hindsight/recall', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          query,
          budget: options?.budget,
          maxTokens: options?.maxTokens,
        }),
      });

      const data = await res.json();
      return data;
    } catch (err: any) {
      return {
        success: false,
        memories: [],
        message: 'Failed to contact DealMate Hindsight server',
        error: err?.message,
      };
    }
  }

  /**
   * REFLECT: Generate synthesized agent reasoning across all accumulated user memories
   */
  public async reflect(
    query: string,
    options?: {
      context?: string;
      budget?: 'low' | 'mid' | 'high';
    }
  ): Promise<{
    success: boolean;
    reflectionText: string;
    bankId?: string;
    message: string;
    error?: string;
  }> {
    try {
      const res = await fetch('/api/hindsight/reflect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          query,
          context: options?.context,
          budget: options?.budget,
        }),
      });

      const data = await res.json();
      return data;
    } catch (err: any) {
      return {
        success: false,
        reflectionText: '',
        message: 'Failed to contact DealMate Hindsight server',
        error: err?.message,
      };
    }
  }

  /**
   * Fetch current Deal DNA profile
   */
  public async getDealDNA(): Promise<DealDnaProfile | null> {
    try {
      const res = await fetch('/api/hindsight/deal-dna', {
        headers: {
          ...getAuthHeaders(),
        },
      });

      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  /**
   * Fetch recent Retain/Recall/Reflect activity logs
   */
  public async getActivity(): Promise<HindsightActivityEntry[]> {
    try {
      const res = await fetch('/api/hindsight/activity', {
        headers: {
          ...getAuthHeaders(),
        },
      });

      if (!res.ok) return [];
      const data = await res.json();
      return data.activity || [];
    } catch {
      return [];
    }
  }

  /**
   * Generate an adaptive negotiation strategy based on user memory
   */
  public async getAdaptiveStrategy(
    productName: string,
    listPrice: number,
    targetPrice: number
  ): Promise<AdaptiveNegotiationStrategy | null> {
    try {
      const res = await fetch('/api/hindsight/adaptive-strategy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          productName,
          listPrice,
          targetPrice,
        }),
      });

      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  /**
   * 90-Second Demo Seed: Pre-populates or clears memories for reliable judging tests
   */
  public async seedDemoSession(scenario: 'headphones_sony' | 'clear'): Promise<boolean> {
    try {
      const res = await fetch('/api/hindsight/demo-seed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ scenario }),
      });

      const data = await res.json();
      this.checkHealth();
      return data.success;
    } catch {
      return false;
    }
  }
}

export const hindsightClient = new HindsightClientService();
