/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { TokenBar } from './components/TokenBar';
import { VolumeHero } from './components/VolumeHero';
import { PumpFunSearchBar } from './components/PumpFunSearchBar';
import { OfflineHtmlModal } from './components/OfflineHtmlModal';
import { ExportModal } from './components/ExportModal';
import { ScrapedTokenData, OfflineTokenSnapshot } from './types';
import { OFFLINE_SNAPSHOTS } from './scrapling/offlineDataset';
import { ScraplingOfflineEngine } from './scrapling/scraplingEngine';
import { fetchLiveTokenData } from './services/liveTokenScraper';
import { convertHtmlToMarkdown } from './scrapling/markdownVolumeEngine';
import { ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';

const DEFAULT_MINT = 'AyYNfPtftg2zDP4ZbgcoQMggQtwLh4zpfVVmUJs2thto'; // Leopardus tilcayo ($Tilcayo)

export default function App() {
  const [activeMint, setActiveMint] = useState<string>(DEFAULT_MINT);
  const [rawHtml, setRawHtml] = useState<string>(() => OFFLINE_SNAPSHOTS[DEFAULT_MINT]?.rawHtml || '');
  const [customMarkdown, setCustomMarkdown] = useState<string | undefined>(
    () => OFFLINE_SNAPSHOTS[DEFAULT_MINT]?.scrapedMarkdown
  );
  const [isScraping, setIsScraping] = useState<boolean>(false);
  const [lastScrapedAt, setLastScrapedAt] = useState<string>('');
  const [isHtmlModalOpen, setIsHtmlModalOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);

  // Trigger live scrape and markdown conversion
  const triggerScrape = useCallback(async (mint: string) => {
    setIsScraping(true);
    try {
      const liveSnapshot = await fetchLiveTokenData(mint);
      OFFLINE_SNAPSHOTS[liveSnapshot.mint] = liveSnapshot;
      setActiveMint(liveSnapshot.mint);
      setRawHtml(liveSnapshot.rawHtml);
      setCustomMarkdown(liveSnapshot.scrapedMarkdown);
      setLastScrapedAt(new Date().toLocaleTimeString());
    } catch {
      // Offline fallback handled in fetchLiveTokenData
    } finally {
      setIsScraping(false);
    }
  }, []);

  // Initial load: scrape live accurate volume on mount
  useEffect(() => {
    triggerScrape(DEFAULT_MINT);
  }, [triggerScrape]);

  // Scrape engine runs when rawHtml or customMarkdown changes
  // Converts to Markdown first and then extracts the volume details properly
  const tokenData: ScrapedTokenData = useMemo(() => {
    const engine = new ScraplingOfflineEngine(rawHtml);
    return engine.executeScrape(activeMint, undefined, customMarkdown);
  }, [rawHtml, activeMint, customMarkdown]);

  // Handle selection from custom search
  const handleSelectToken = useCallback((mint: string, customSnapshot?: OfflineTokenSnapshot) => {
    if (customSnapshot) {
      OFFLINE_SNAPSHOTS[customSnapshot.mint] = customSnapshot;
      setActiveMint(customSnapshot.mint);
      setRawHtml(customSnapshot.rawHtml);
      setCustomMarkdown(customSnapshot.scrapedMarkdown);
      setLastScrapedAt(new Date().toLocaleTimeString());
      return;
    }
    triggerScrape(mint);
  }, [triggerScrape]);

  // Handle uploading an offline HTML document
  const handleUploadHtmlFile = useCallback((content: string, filename: string) => {
    setRawHtml(content);
    // Convert HTML to markdown first
    const generatedMd = convertHtmlToMarkdown(content);
    setCustomMarkdown(generatedMd);
    setActiveMint(`custom-${Date.now()}`);
    setLastScrapedAt(new Date().toLocaleTimeString());
  }, []);

  // Handle custom HTML edit from the modal
  const handleApplyCustomHtml = useCallback((newHtml: string) => {
    setRawHtml(newHtml);
    const generatedMd = convertHtmlToMarkdown(newHtml);
    setCustomMarkdown(generatedMd);
    setLastScrapedAt(new Date().toLocaleTimeString());
  }, []);

  const handleResetToDefault = useCallback(() => {
    triggerScrape(DEFAULT_MINT);
  }, [triggerScrape]);

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col selection:bg-emerald-500 selection:text-black">
      {/* Top Navigation Bar: Clean, focused, no rapid timers, no scraping log button */}
      <Navbar
        onRefresh={() => triggerScrape(activeMint)}
        isScraping={isScraping}
        onOpenHtmlModal={() => setIsHtmlModalOpen(true)}
        onExport={() => setIsExportModalOpen(true)}
        onExportMarkdown={() => setIsExportModalOpen(true)}
      />

      {/* Token Header: Token name, symbol, mint address & copy, source link, no presets */}
      <TokenBar
        tokenData={tokenData}
        activeMint={activeMint}
        onUploadHtmlFile={handleUploadHtmlFile}
      />

      {/* Main Content Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Search Bar for pump.fun tokens / mint addresses: No trending tokens */}
        <section aria-label="Pump.fun Token Search">
          <PumpFunSearchBar
            activeMint={activeMint}
            onSelectToken={handleSelectToken}
            isScrapingExternal={isScraping}
          />
        </section>

        {/* Pipeline Status Indicator */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 bg-zinc-950 border border-emerald-500/20 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="text-xs font-mono">
              <span className="text-white font-bold">ACCURATE VOLUME PIPELINE:</span>{' '}
              <span className="text-zinc-400">
                Scraped on-chain pool data is first converted to Markdown, and 5M, 1H, and 24H volume details are properly parsed directly from the Markdown table.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400 whitespace-nowrap self-end sm:self-center">
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span>Last Scrape: {lastScrapedAt || 'Loaded'}</span>
          </div>
        </div>

        {/* Primary Volume Hero: Strictly 5M, 1H, 24H volume with accurate Buy/Sell data & transactions */}
        <VolumeHero tokenData={tokenData} />
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-zinc-800 bg-zinc-950/80 py-4 px-4 sm:px-6 mt-8 font-mono text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>TGX / VOLUME-SCRAPE • Markdown-Driven Volume Telemetry</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>TIME-FRAMES: 5M • 1H • 24H</span>
            <span>•</span>
            <span>ACCURATE ON-CHAIN VOLUME</span>
          </div>
        </div>
      </footer>

      {/* Offline Raw HTML Source Editor & Sandbox Modal */}
      <OfflineHtmlModal
        isOpen={isHtmlModalOpen}
        onClose={() => setIsHtmlModalOpen(false)}
        rawHtml={rawHtml}
        onApplyCustomHtml={handleApplyCustomHtml}
        onResetToDefault={handleResetToDefault}
        tokenSymbol={tokenData.symbol}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        tokenData={tokenData}
      />
    </div>
  );
}
