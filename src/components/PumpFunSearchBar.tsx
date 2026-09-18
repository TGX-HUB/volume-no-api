/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Search, X, ArrowRight, Loader2, Link2 } from 'lucide-react';
import { fetchLiveTokenData } from '../services/liveTokenScraper';
import { OfflineTokenSnapshot } from '../types';

interface PumpFunSearchBarProps {
  activeMint: string;
  onSelectToken: (mint: string, customSnapshot?: OfflineTokenSnapshot) => void;
  isScrapingExternal?: boolean;
}

export const PumpFunSearchBar: React.FC<PumpFunSearchBarProps> = ({
  activeMint,
  onSelectToken,
  isScrapingExternal = false,
}) => {
  const [query, setQuery] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleScrape = async () => {
    const raw = query.trim();
    if (!raw) return;
    setIsScraping(true);
    try {
      const liveSnapshot = await fetchLiveTokenData(raw);
      onSelectToken(liveSnapshot.mint, liveSnapshot);
      setQuery('');
    } catch {
      // Failed or offline fallback handled inside fetchLiveTokenData
    } finally {
      setIsScraping(false);
    }
  };

  const handleKeyDownInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleScrape();
    }
  };

  const activeLoading = isScraping || isScrapingExternal;

  return (
    <div className="w-full max-w-4xl mx-auto my-4 px-4 sm:px-0">
      <div className="relative flex items-center bg-zinc-950/90 border border-zinc-800 hover:border-zinc-700 focus-within:border-emerald-500/80 rounded-xl shadow-lg transition-all">
        <div className="pl-4 pr-2 text-zinc-500 flex items-center">
          {activeLoading ? (
            <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
          ) : (
            <Search className="w-4 h-4 text-zinc-400" />
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          id="pumpfun-token-search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDownInput}
          placeholder="Paste Pump.fun coin link (https://pump.fun/coin/...) or Solana mint address..."
          className="w-full bg-transparent py-3 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none font-mono"
          autoComplete="off"
          spellCheck={false}
          disabled={activeLoading}
        />

        {query && (
          <button
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
            className="p-1.5 mr-2 text-zinc-500 hover:text-zinc-300 rounded-md transition-colors"
            title="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        <div className="flex items-center gap-1.5 pr-2 sm:pr-3">
          <span className="hidden sm:inline px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-900 text-zinc-500 border border-zinc-800">
            /
          </span>
          <button
            onClick={handleScrape}
            disabled={!query.trim() || activeLoading}
            id="scrape-submit-btn"
            className="px-3 py-1.5 text-xs font-mono font-bold rounded-lg bg-emerald-500 text-black hover:bg-emerald-400 disabled:opacity-40 disabled:pointer-events-none transition-colors flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
          >
            {activeLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Scraping...</span>
              </>
            ) : (
              <>
                <span>Scrape &amp; Convert</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 mt-2 px-1">
        <span className="flex items-center gap-1">
          <Link2 className="w-3 h-3 text-zinc-400" />
          Target: Scrapes directly from pump.fun or AMM pool &gt; Converts to Markdown &gt; Extracts Volume
        </span>
        <span>Active Mint: <code className="text-zinc-400">{activeMint.slice(0, 6)}...{activeMint.slice(-4)}</code></span>
      </div>
    </div>
  );
};
