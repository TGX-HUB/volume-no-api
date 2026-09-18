/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Standalone Offline Volume Scraper CLI
 * Operates entirely offline without external APIs using Scrapling manual DOM extraction.
 */

import { ScraplingOfflineEngine, STRICT_NO_API_LOCK } from './scrapling/scraplingEngine';
import { OFFLINE_SNAPSHOTS } from './scrapling/offlineDataset';

function runCli() {
  console.log('===============================================================');
  console.log(' TGX-HUB / VOLUME-SCRAPE • Pure Manual Scraper (Zero-API Edition)');
  console.log(' Engine: github.com/d4vinci/scrapling (Manual DOM / Regex Parser)');
  console.log(` Status: STRICT_NO_API_LOCK = ${JSON.stringify(STRICT_NO_API_LOCK)}`);
  console.log('===============================================================\n');

  const defaultMint = 'EpXtn6xGoZ4Y45vRjiDUHSCGbBoJD5FaEqZbF98YswH1';
  const snapshot = OFFLINE_SNAPSHOTS[defaultMint];

  if (!snapshot) {
    console.error('Error: Offline snapshot not found.');
    process.exit(1);
  }

  console.log(`[+] Loaded Offline HTML Document for: ${snapshot.name} ($${snapshot.symbol})`);
  console.log(`[+] Document Size: ${snapshot.rawHtml.length} bytes`);
  console.log('[+] Executing Scrapling adaptive manual scraper...\n');

  const engine = new ScraplingOfflineEngine(snapshot.rawHtml);
  const result = engine.executeScrape(defaultMint);

  console.log('---------------------------------------------------------------');
  console.log(` TOKEN:          ${result.name} ($${result.symbol})`);
  console.log(` MINT:           ${result.mint}`);
  console.log(` PRICE (USD):    $${result.priceUsd.toFixed(4)}`);
  console.log(` MARKET CAP:     $${result.marketCapUsd.toLocaleString()}`);
  console.log(` 24H VOLUME:     $${result.volume24h.toLocaleString()}`);
  console.log(` 6H VOLUME:      $${result.volume6h.toLocaleString()}`);
  console.log(` 1H VOLUME:      $${result.volume1h.toLocaleString()}`);
  console.log(` 5M VOLUME:      $${result.volume5m.toLocaleString()}`);
  console.log(` BUY VOLUME:     $${result.volumeBuy24h.toLocaleString()}`);
  console.log(` SELL VOLUME:    $${result.volumeSell24h.toLocaleString()}`);
  console.log(` 24H TXNS:       ${result.txns24h.total.toLocaleString()} (${result.txns24h.buys} buys / ${result.txns24h.sells} sells)`);
  console.log(` BONDING CURVE:  ${result.bondingCurveProgress}% (${result.isComplete ? 'Migrated to AMM' : 'Active'})`);
  console.log(` DEV REMAINING:  ${result.audit.devHoldingsPercent}%`);
  console.log(` TOP 10 HOLDERS: ${result.audit.top10HoldersPercent}%`);
  console.log(` PARSE SPEED:    ${result.scraplingTelemetry.parseDurationMs} ms`);
  console.log(` EXT API CALLS:  ${result.scraplingTelemetry.externalApiBlockedCount} (Strict Zero-API Verified)`);
  console.log('---------------------------------------------------------------\n');
  console.log('[✓] Scrape complete. 100% offline with zero remote dependencies.');
}

if (typeof process !== 'undefined' && process.argv && process.argv[1]?.includes('cli')) {
  runCli();
}

export { runCli };
