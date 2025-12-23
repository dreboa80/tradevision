
export interface MarketBias {
  direction: 'BUY' | 'SELL' | 'NEUTRAL';
  confidence: number;
}

export interface LiquidityZone {
  type: 'BUYSIDE' | 'SELLSIDE';
  price_approx: number | string;
  strength: 'low' | 'medium' | 'high';
  reason: string;
}

export interface InstitutionalReading {
  market_intent: string;
  retail_traps: string;
  liquidity_objective: string;
}

export type SetupResult = 'WIN' | 'LOSS' | 'BE' | 'PENDING';

export interface Setup {
  type: 'pullback' | 'confirmation';
  risk_profile: 'aggressive' | 'conservative';
  entry: number | string;
  stop_loss: number | string;
  tp1: number | string;
  tp2: number | string;
  tp3: number | string;
  reliability: number;
  risk_reward: string;
  logic: string;
  expiry: string; // Date et heure d'expiration du signal
  user_result?: SetupResult; 
}

export interface Setups {
  setup_A: Setup;
  setup_B: Setup;
}

export interface InvalidationRules {
  bias_invalidation: string;
  setup_invalidation: string;
}

export interface AnalysisResponse {
  asset_class: string;
  market_bias: MarketBias;
  liquidity_zones: LiquidityZone[];
  institutional_reading: InstitutionalReading;
  setups: Setups;
  invalidation_rules: InvalidationRules;
  limitations: string[];
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  data: AnalysisResponse;
}

export type PlanType = 'silver' | 'gold' | null;

export interface SubscriptionStatus {
  plan: PlanType;
  startDate: number;
  expiryDate?: number;
}
