/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Copy, Check, Upload, ExternalLink, Globe } from 'lucide-react';
import { ScrapedTokenData } from '../types';

interface TokenBarProps {
  tokenData: ScrapedTokenData;
  activeMint: string;
  onUploadHtmlFile: (content: string, filename: string) => void;
}

export const TokenBar: React.FC<TokenBarProps> = ({
  tokenData,
  onUploadHtmlFile,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyMint = () => {
    if (tokenData?.mint) {
      navigator.clipboard.writeText(tokenData.mint);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const text = evt.target?.result as string;
        if (text) {
          onUploadHtmlFile(text, file.name);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="w-full bg-zinc-950 border-b border-zinc-800/80 py-4 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Token Metadata Header */}
        <div className="flex items-center gap-3.5">
          <img
            src={tokenData.imageUri}
            alt={tokenData.name}
            className="w-12 h-12 rounded-full border border-zinc-700/80 bg-zinc-900 object-cover flex-shrink-0"
            referrerPolicy="no-referrer"
          />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold font-mono text-white tracking-tight">
                {tokenData.name}
              </h1>
              <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-zinc-800 text-emerald-400 border border-zinc-700">
                ${tokenData.symbol}
              </span>
            </div>

            {/* Mint Address with Copy */}
            <div className="flex items-center gap-2 mt-1 text-xs font-mono text-zinc-400">
              <span className="text-zinc-500">MINT:</span>
              <span className="text-zinc-300 select-all">{tokenData.mint}</span>
              <button
                onClick={handleCopyMint}
                className="hover:text-white transition-colors p-0.5"
                title="Copy Mint Address"
                id="copy-mint-btn"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Scraped Source Link */}
            <div className="flex items-center gap-2 mt-1 text-[11px] font-mono text-zinc-400">
              <span className="text-zinc-500 flex items-center gap-1">
                <Globe className="w-3 h-3 text-emerald-400" />
                SOURCE:
              </span>
              <a
                href={tokenData.sourceUrl || `https://pump.fun/coin/${tokenData.mint}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1 truncate max-w-[280px] sm:max-w-md"
                title={`Target URL: ${tokenData.sourceUrl || `https://pump.fun/coin/${tokenData.mint}`}`}
              >
                <span>{tokenData.sourceUrl || `https://pump.fun/coin/${tokenData.mint}`}</span>
                <ExternalLink className="w-3 h-3 flex-shrink-0" />
              </a>
            </div>
          </div>
        </div>

        {/* Upload Custom HTML Action */}
        <div className="flex items-center gap-2">
          <label
            htmlFor="upload-offline-html"
            className="cursor-pointer px-3 py-2 rounded-lg text-xs font-mono font-medium bg-zinc-900 hover:bg-zinc-800 text-sky-400 border border-zinc-800 hover:border-zinc-700 flex items-center gap-1.5 transition-colors"
            title="Upload any offline HTML document to convert and parse"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Custom HTML</span>
            <input
              id="upload-offline-html"
              type="file"
              accept=".html,.htm,.txt"
              className="hidden"
              onChange={handleFileInput}
            />
          </label>
        </div>
      </div>
    </div>
  );
};
