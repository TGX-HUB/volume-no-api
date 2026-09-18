/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { RefreshCw, FileCode, Download, FileText, CheckCircle2 } from 'lucide-react';

interface NavbarProps {
  onRefresh: () => void;
  isScraping: boolean;
  onOpenHtmlModal: () => void;
  onExport: () => void;
  onExportMarkdown?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onRefresh,
  isScraping,
  onOpenHtmlModal,
  onExport,
  onExportMarkdown,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-black/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-mono font-bold text-base shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            VS
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold tracking-tight text-white text-base">
                TGX / VOLUME-SCRAPE
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="w-3 h-3" />
                MARKDOWN PIPELINE
              </span>
            </div>
            <p className="text-[11px] font-mono text-zinc-400">
              Scrape &gt; Convert to Markdown &gt; Accurate 5M, 1H, 24H Volume
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Re-Scrape Action */}
          <button
            onClick={onRefresh}
            disabled={isScraping}
            id="refresh-scrape-btn"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-medium transition-colors disabled:opacity-50"
            title="Trigger scrape to update volume and transaction metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScraping ? 'animate-spin text-emerald-400' : 'text-emerald-400'}`} />
            <span>{isScraping ? 'SCRAPING...' : 'SCRAPE & UPDATE'}</span>
          </button>

          {/* Raw HTML Source Modal Button */}
          <button
            onClick={onOpenHtmlModal}
            id="view-html-source-btn"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 text-xs font-mono transition-colors"
            title="Inspect or paste custom offline HTML document"
          >
            <FileCode className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Offline HTML</span>
          </button>

          {/* Export Markdown */}
          {onExportMarkdown && (
            <button
              onClick={onExportMarkdown}
              id="export-markdown-btn"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 text-xs font-mono transition-colors"
              title="Export scraped markdown document"
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">Markdown</span>
            </button>
          )}

          {/* Export JSON Button */}
          <button
            onClick={onExport}
            id="export-scraped-data-btn"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 text-xs font-mono transition-colors"
            title="Export scraped volume data as JSON"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">JSON</span>
          </button>
        </div>
      </div>
    </header>
  );
};
