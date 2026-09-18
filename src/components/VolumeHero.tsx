/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  FileText,
  Copy,
  Check,
  Activity,
  Layers,
} from 'lucide-react';
import Markdown from 'react-markdown';
import { ScrapedTokenData } from '../types';

interface VolumeHeroProps {
  tokenData: ScrapedTokenData;
}

export const VolumeHero: React.FC<VolumeHeroProps> = ({ tokenData }) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'5m' | '1h' | '24h'>('24h');
  const [viewMode, setViewMode] = useState<'metrics' | 'markdown'>('metrics');
  const [copiedMd, setCopiedMd] = useState(false);

  // Format currency with standard notation
  const formatUsd = (val: number) => {
    if (!val || isNaN(val)) return '$0';
    if (val >= 1_000_000_000) return `$${(val / 1_000_000_000).toFixed(3)}B`;
    if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(2)}M`;
    if (val >= 1_000) return `$${(val / 1_000).toFixed(1)}K`;
    return `$${val.toFixed(2)}`;
  };

  const formatExactUsd = (val: number) => {
    if (!val || isNaN(val)) return '$0';
    return `$${Math.round(val).toLocaleString()}`;
  };

  const currentActivity = tokenData.marketActivity[selectedTimeframe];
  const activeVolume = currentActivity?.volumeUSD || (selectedTimeframe === '24h' ? tokenData.volume24h : 0);
  const activeBuyVol = currentActivity?.buyVolumeUSD || (selectedTimeframe === '24h' ? tokenData.volumeBuy24h : activeVolume * 0.5);
  const activeSellVol = currentActivity?.sellVolumeUSD || (selectedTimeframe === '24h' ? tokenData.volumeSell24h : activeVolume * 0.5);

  const buyRatio = activeVolume > 0 ? Math.min(100, Math.max(0, (activeBuyVol / activeVolume) * 100)) : 50;
  const sellRatio = 100 - buyRatio;

  const buyTxns = currentActivity?.numBuys || (selectedTimeframe === '24h' ? tokenData.txns24h.buys : 0);
  const sellTxns = currentActivity?.numSells || (selectedTimeframe === '24h' ? tokenData.txns24h.sells : 0);
  const totalTxns = currentActivity?.numTxs || (selectedTimeframe === '24h' ? tokenData.txns24h.total : buyTxns + sellTxns);

  const priceChange = currentActivity?.priceChangePercent ?? (selectedTimeframe === '24h' ? tokenData.priceChange24h : 0);
  const isPositive = priceChange >= 0;

  const handleCopyMarkdown = () => {
    if (tokenData.scrapedMarkdown) {
      navigator.clipboard.writeText(tokenData.scrapedMarkdown);
      setCopiedMd(true);
      setTimeout(() => setCopiedMd(false), 1500);
    }
  };

  return (
    <div className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
      {/* Subtle Background Accent */}
      <div className="absolute -right-16 -top-16 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar: Title, View Mode & Timeframe Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            <h2 className="text-xs font-mono font-bold tracking-wider text-zinc-400 uppercase">
              AMM Trading Volume Telemetry
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-900 text-emerald-400 border border-zinc-800">
              SCRAPED VIA MARKDOWN
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Exact 5M, 1H, and 24H volume &amp; transactions extracted directly from scraped Markdown
          </p>
        </div>

        {/* View Mode & Timeframe Switcher */}
        <div className="flex items-center gap-2">
          {/* Toggle between Metrics Card and Converted Markdown */}
          <div className="flex items-center bg-zinc-900/90 border border-zinc-800 p-0.5 rounded-lg text-xs font-mono">
            <button
              onClick={() => setViewMode('metrics')}
              id="btn-view-metrics"
              className={`flex items-center gap-1 px-2.5 py-1 rounded transition-all ${
                viewMode === 'metrics'
                  ? 'bg-zinc-800 text-white font-bold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Metrics</span>
            </button>
            <button
              onClick={() => setViewMode('markdown')}
              id="btn-view-markdown"
              className={`flex items-center gap-1 px-2.5 py-1 rounded transition-all ${
                viewMode === 'markdown'
                  ? 'bg-emerald-500 text-black font-bold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Markdown Source</span>
            </button>
          </div>

          {/* Timeframe Buttons: 5M, 1H, 24H */}
          {viewMode === 'metrics' && (
            <div className="flex items-center bg-zinc-900/90 border border-zinc-800 p-0.5 rounded-lg">
              {(['5m', '1h', '24h'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setSelectedTimeframe(tf)}
                  id={`btn-timeframe-${tf}`}
                  className={`px-3 py-1 rounded text-xs font-mono font-semibold transition-all ${
                    selectedTimeframe === tf
                      ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {tf.toUpperCase()}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {viewMode === 'markdown' ? (
        /* Markdown Source Viewer */
        <div className="my-6">
          <div className="flex items-center justify-between mb-3 bg-zinc-900/80 px-4 py-2 rounded-lg border border-zinc-800 text-xs font-mono">
            <span className="text-zinc-400 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-emerald-400" />
              Generated Markdown Representation (Intermediate Parsing Pipeline)
            </span>
            <button
              onClick={handleCopyMarkdown}
              id="btn-copy-markdown-source"
              className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              {copiedMd ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedMd ? 'Copied' : 'Copy Markdown'}</span>
            </button>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 font-mono text-xs text-zinc-200 max-h-[500px] overflow-y-auto leading-relaxed">
            <div className="markdown-body prose prose-invert max-w-none prose-table:border prose-table:border-zinc-800 prose-th:bg-zinc-900 prose-th:p-2 prose-td:p-2 prose-td:border-t prose-td:border-zinc-800">
              <Markdown>
                {tokenData.scrapedMarkdown || 'No markdown generated yet.'}
              </Markdown>
            </div>
          </div>
        </div>
      ) : (
        /* Standard Visual Metrics View */
        <>
          {/* Primary Hero Metric */}
          <div className="my-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 mb-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-zinc-400 font-bold">{selectedTimeframe.toUpperCase()} VOLUME</span>
                <span className={`px-1.5 py-0.2 rounded text-[11px] font-bold ${isPositive ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'}`}>
                  {isPositive ? '+' : ''}{priceChange}%
                </span>
              </div>
              <div className="text-3xl sm:text-5xl font-mono font-extrabold text-white tracking-tight flex items-baseline gap-2">
                <span id="hero-volume-usd">{formatExactUsd(activeVolume)}</span>
                <span className="text-sm sm:text-base font-normal text-zinc-400 font-sans">USD</span>
              </div>
              <div className="flex items-center gap-3 mt-2 text-xs font-mono flex-wrap">
                <span className="text-emerald-400 font-medium">
                  Buy: {formatExactUsd(activeBuyVol)} ({buyRatio.toFixed(1)}%)
                </span>
                <span className="text-zinc-600">•</span>
                <span className="text-rose-400 font-medium">
                  Sell: {formatExactUsd(activeSellVol)} ({sellRatio.toFixed(1)}%)
                </span>
                <span className="text-zinc-600">•</span>
                <span className="text-zinc-400 font-medium">
                  Txns: {totalTxns.toLocaleString()} ({buyTxns.toLocaleString()} B / {sellTxns.toLocaleString()} S)
                </span>
              </div>
            </div>

            {/* Buy / Sell Volume Breakdown Metric Card */}
            <div className="w-full md:w-88 bg-zinc-900/80 border border-zinc-800/90 rounded-lg p-3.5 font-mono">
              <div className="flex justify-between items-center text-xs mb-2">
                <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  BUY: {formatExactUsd(activeBuyVol)}
                </span>
                <span className="text-rose-400 flex items-center gap-1 font-semibold">
                  <ArrowDownRight className="w-3.5 h-3.5" />
                  SELL: {formatExactUsd(activeSellVol)}
                </span>
              </div>

              {/* Dual Color Volume Ratio Bar */}
              <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden flex">
                <div
                  className="bg-emerald-500 h-full transition-all duration-300"
                  style={{ width: `${buyRatio}%` }}
                  title={`Buy Volume: ${buyRatio.toFixed(1)}%`}
                />
                <div
                  className="bg-rose-500 h-full transition-all duration-300"
                  style={{ width: `${sellRatio}%` }}
                  title={`Sell Volume: ${sellRatio.toFixed(1)}%`}
                />
              </div>

              <div className="flex justify-between text-[11px] text-zinc-400 mt-2">
                <span className="text-emerald-400/90">
                  {buyRatio.toFixed(1)}% ({buyTxns.toLocaleString()} buys)
                </span>
                <span className="text-rose-400/90">
                  {sellRatio.toFixed(1)}% ({sellTxns.toLocaleString()} sells)
                </span>
              </div>
            </div>
          </div>

          {/* 3 Timeframe Snapshot Grid: 5M, 1H, 24H Volume Only */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4 border-t border-zinc-800/80">
            {(['5m', '1h', '24h'] as const).map((period) => {
              const act = tokenData.marketActivity[period];
              const isPeriodPositive = (act?.priceChangePercent ?? 0) >= 0;
              const volUsd = period === '24h' ? tokenData.volume24h : (act?.volumeUSD ?? 0);
              const buyVol = period === '24h' ? tokenData.volumeBuy24h : (act?.buyVolumeUSD ?? volUsd * 0.5);
              const sellVol = period === '24h' ? tokenData.volumeSell24h : (act?.sellVolumeUSD ?? volUsd * 0.5);
              const bTx = act?.numBuys ?? (period === '24h' ? tokenData.txns24h.buys : 0);
              const sTx = act?.numSells ?? (period === '24h' ? tokenData.txns24h.sells : 0);

              return (
                <div
                  key={period}
                  onClick={() => setSelectedTimeframe(period)}
                  className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                    selectedTimeframe === period
                      ? 'bg-zinc-900 border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.1)]'
                      : 'bg-zinc-950/60 border-zinc-800 hover:bg-zinc-900/60 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex justify-between items-center text-xs font-mono text-zinc-400 mb-1.5">
                    <span className="font-bold text-zinc-300">{period.toUpperCase()} VOLUME</span>
                    <span className={`flex items-center text-[11px] font-bold ${isPeriodPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isPeriodPositive ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                      {isPeriodPositive ? '+' : ''}{act?.priceChangePercent ?? 0}%
                    </span>
                  </div>
                  <div className="text-xl font-mono font-bold text-white">
                    {formatExactUsd(volUsd)}
                  </div>
                  <div className="text-[11px] font-mono text-zinc-400 mt-1 flex justify-between">
                    <span className="text-emerald-400/90">Buy: {formatUsd(buyVol)} ({bTx.toLocaleString()} txs)</span>
                    <span className="text-rose-400/90">Sell: {formatUsd(sellVol)} ({sTx.toLocaleString()} txs)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
