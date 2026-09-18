/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, FileCode, Play, Copy, Check, RotateCcw, AlertTriangle } from 'lucide-react';

interface OfflineHtmlModalProps {
  isOpen: boolean;
  onClose: () => void;
  rawHtml: string;
  onApplyCustomHtml: (newHtml: string) => void;
  onResetToDefault: () => void;
  tokenSymbol: string;
}

export const OfflineHtmlModal: React.FC<OfflineHtmlModalProps> = ({
  isOpen,
  onClose,
  rawHtml,
  onApplyCustomHtml,
  onResetToDefault,
  tokenSymbol,
}) => {
  const [editedHtml, setEditedHtml] = useState(rawHtml);
  const [copied, setCopied] = useState(false);

  // Sync state if rawHtml changes when opening
  React.useEffect(() => {
    setEditedHtml(rawHtml);
  }, [rawHtml, isOpen]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(editedHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleApply = () => {
    onApplyCustomHtml(editedHtml);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in font-mono">
      <div className="w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-zinc-900/80">
          <div className="flex items-center gap-2.5">
            <FileCode className="w-4 h-4 text-sky-400" />
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">
                OFFLINE HTML SOURCE VIEWER & SCRAPLING SANDBOX
              </h2>
              <p className="text-[11px] text-zinc-400">
                Current token: ${tokenSymbol} • {editedHtml.length.toLocaleString()} bytes • 100% In-Memory Offline
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notice banner */}
        <div className="bg-emerald-950/20 border-b border-emerald-900/30 px-5 py-2 flex items-center justify-between text-xs text-emerald-400">
          <span className="flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            Strict Zero-API active: Data is parsed strictly from this HTML string via CSS, XPath, & Regex.
          </span>
          <span className="text-[10px] text-zinc-400">No external network fetch</span>
        </div>

        {/* Textarea for Raw HTML */}
        <div className="flex-1 p-4 overflow-hidden flex flex-col">
          <textarea
            value={editedHtml}
            onChange={(e) => setEditedHtml(e.target.value)}
            className="w-full h-full min-h-[360px] bg-black text-emerald-300 font-mono text-xs p-4 rounded-lg border border-zinc-800 focus:border-zinc-700 focus:outline-none resize-none leading-relaxed"
            placeholder="Paste raw HTML here to scrape..."
            spellCheck={false}
          />
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 border-t border-zinc-800 bg-zinc-900/50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied HTML' : 'Copy HTML'}</span>
            </button>

            <button
              onClick={() => {
                onResetToDefault();
                onClose();
              }}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Default</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 text-xs transition-colors"
            >
              Cancel
            </button>

            <button
              onClick={handleApply}
              id="apply-html-btn"
              className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center gap-1.5 transition-colors shadow-lg shadow-emerald-500/20"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Run Scrapling Offline Parser</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
