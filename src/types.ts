/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MarketActivityTimeframe {
  numTxs: number;
  volumeUSD: number;
  numUsers: number;
  numBuys: number;
  numSells: number;
  buyVolumeUSD: number;
  sellVolumeUSD: number;
  numBuyers: number;
  numSellers: number;
  priceChangePercent: number;
}

export interface MarketActivity {
  '5m': MarketActivityTimeframe;
  '1h': MarketActivityTimeframe;
  '6h': MarketActivityTimeframe;
  '24h': MarketActivityTimeframe;
}

export interface TopHolder {
  address: string;
  amount: number;
  percentage: number;
  isDev: boolean;
  isSniper: boolean;
  isBundler: boolean;
}

export interface SecurityAudit {
  totalHolders: number;
  top10HoldersPercent: number;
  devHoldingsPercent: number;
  snipersOwnedPercent: number;
  bundlerOwnedPercentageV2: number;
  totalFeesSol: number;
  topHolders: TopHolder[];
}

export interface TradeItem {
  id: string;
  txHash: string;
  isBuy: boolean;
  solAmount: number;
  tokenAmount: number;
  usdAmount: number;
  priceUsd: number;
  user: string;
  timestamp: number;
  timeAgo: string;
}

export interface ScraplingExtractionTrace {
  ruleName: string;
  technique: 'CSS Selector' | 'XPath' | 'Regex Extraction' | 'DOM Traversal' | 'Embedded Hydration Script' | 'Adaptive Fallback';
  selectorOrPattern: string;
  matchedValue: string;
  confidence: number;
  durationMs: number;
}

export interface ScraplingTelemetry {
  parseDurationMs: number;
  domNodesInspected: number;
  extractedFieldsCount: number;
  externalApiBlockedCount: number;
  isStrictlyOffline: boolean;
  extractionTraces: ScraplingExtractionTrace[];
}

export interface ScrapedTokenData {
  mint: string;
  name: string;
  symbol: string;
  description: string;
  imageUri: string;
  priceUsd: number;
  priceSol: number;
  marketCapUsd: number;
  marketCapSol: number;
  volume24h: number;
  volume6h: number;
  volume1h: number;
  volume5m: number;
  volumeBuy24h: number;
  volumeSell24h: number;
  txns24h: {
    buys: number;
    sells: number;
    total: number;
  };
  priceChange24h: number;
  priceChange1h: number;
  priceChange5m: number;
  bondingCurveProgress: number;
  isComplete: boolean;
  raydiumPool: string | null;
  creator: string;
  createdTimeAgo: string;
  website?: string;
  twitter?: string;
  telegram?: string;
  scrapedAt: string;
  source: string;
  sourceUrl: string;
  audit: SecurityAudit;
  recentTrades: TradeItem[];
  marketActivity: MarketActivity;
  scraplingTelemetry: ScraplingTelemetry;
  rawHtmlLength: number;
  scrapedMarkdown?: string;
}

export interface OfflineTokenSnapshot {
  mint: string;
  name: string;
  symbol: string;
  description: string;
  rawHtml: string;
  sourceUrl?: string;
  scrapedMarkdown?: string;
}
