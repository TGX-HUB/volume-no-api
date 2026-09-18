/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Download, Copy, Check, FileSpreadsheet, Code, FileText } from 'lucide-react';
import { ScrapedTokenData } from '../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokenData: ScrapedTokenData;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, tokenData }) => {
  const [format, setFormat] = useState<'json' | 'markdown' | 'csv'>('markdown');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const jsonString = JSON.stringify(tokenData, null, 2);
  const markdownString = tokenData.scrapedMarkdown || `# ${tokenData.name} ($${tokenData.symbol})\nVolume 24h: $${tokenData.volume24h.toLocaleString()}`;

  const generateCsv = () => {
    const rows = [
      ['Timestamp', 'Token Name', 'Symbol', 'Mint', '5m Volume USD', '1h Volume USD', '24h Volume USD', 'Buy Volume 24h USD', 'Sell Volume 24h USD', 'Total 24h Txns', 'Buy Txns', 'Sell Txns'],
      [
        tokenData.scrapedAt,
        `"${tokenData.name}"`,
        tokenData.symbol,
        tokenData.mint,
        tokenData.volume5m,
        tokenData.volume1h,
        tokenData.volume24h,
        tokenData.volumeBuy24h,
        tokenData.volumeSell24h,
        tokenData.txns24h.total,
        tokenData.txns24h.buys,
        tokenData.txns24h.sells,
      ],
    ];
    return rows.map((r) => r.join(',')).join('\n');
  };

  const exportContent = format === 'json' ? jsonString : format === 'markdown' ? markdownString : generateCsv();

  const handleCopy = () => {
    navigator.clipboard.writeText(exportContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDownload = () => {
    const mimeType =
      format === 'json'
        ? 'application/json'
        : format === 'markdown'
        ? 'text/markdown'
        : 'text/csv';
    const ext = format === 'markdown' ? 'md' : format;
    const filename = `${tokenData.symbol.toLowerCase()}-volume.${ext}`;
    const blob = new Blob([exportContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in font-mono">
      <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-zinc-900/80">
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight">
              EXPORT SCRAPED VOLUME TELEMETRY
            </h2>
            <p className="text-[11px] text-zinc-400">
              Intermediate Markdown &amp; Parsed Volume Data
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Format Selector */}
        <div className="px-5 py-2.5 bg-zinc-900/40 border-b border-zinc-800 flex items-center gap-2">
          <button
            onClick={() => setFormat('markdown')}
            className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              format === 'markdown'
                ? 'bg-emerald-500 text-black'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Markdown (.md)
          </button>
          <button
            onClick={() => setFormat('json')}
            className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              format === 'json'
                ? 'bg-emerald-500 text-black'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            JSON Format
          </button>
          <button
            onClick={() => setFormat('csv')}
            className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              format === 'csv'
                ? 'bg-emerald-500 text-black'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            CSV Format
          </button>
        </div>

        {/* Preview Area */}
        <div className="flex-1 p-4 overflow-y-auto bg-black">
          <pre className="text-xs text-zinc-300 font-mono whitespace-pre-wrap select-all bg-zinc-950 p-3 rounded-lg border border-zinc-850">
            {exportContent}
          </pre>
        </div>

        {/* Actions */}
        <div className="px-5 py-3 border-t border-zinc-800 bg-zinc-900/60 flex items-center justify-between">
          <span className="text-[11px] text-zinc-500">
            Size: {(new TextEncoder().encode(exportContent).length / 1024).toFixed(1)} KB
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md shadow-emerald-500/20"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
