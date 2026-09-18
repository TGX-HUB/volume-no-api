/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface VolumeMetrics {
  volumeUSD: number;
  buyVolumeUSD: number;
  sellVolumeUSD: number;
  numBuys: number;
  numSells: number;
  numTxs: number;
  buyRatio: number;
  sellRatio: number;
  priceChangePercent: number;
}

export interface MarkdownVolumeBreakdown {
  markdownText: string;
  tokenName: string;
  tokenSymbol: string;
  mint: string;
  sourceUrl: string;
  priceUsd: number;
  marketCapUsd: number;
  periods: {
    '5m': VolumeMetrics;
    '1h': VolumeMetrics;
    '24h': VolumeMetrics;
  };
}

/**
 * Generates a clean, comprehensive Markdown document from scraped on-chain token data.
 */
export function buildTokenMarkdown(params: {
  mint: string;
  name: string;
  symbol: string;
  priceUsd: number;
  marketCapUsd: number;
  sourceUrl: string;
  imageUri?: string;
  m5: { volume: number; buys: number; sells: number; priceChange?: number };
  h1: { volume: number; buys: number; sells: number; priceChange?: number };
  h24: { volume: number; buys: number; sells: number; priceChange?: number };
}): string {
  const { mint, name, symbol, priceUsd, marketCapUsd, sourceUrl, m5, h1, h24 } = params;

  // Calculate buy/sell volume strictly proportional to buy/sell trades
  const calcPeriod = (vol: number, buys: number, sells: number, change: number = 0) => {
    const totalTxs = buys + sells > 0 ? buys + sells : 1;
    const buyRatio = (buys / totalTxs) * 100;
    const sellRatio = 100 - buyRatio;
    const buyVolume = Math.round(vol * (buys / totalTxs));
    const sellVolume = vol - buyVolume;
    return {
      vol,
      buyVolume,
      sellVolume,
      buys,
      sells,
      totalTxs,
      buyRatio: Number(buyRatio.toFixed(1)),
      sellRatio: Number(sellRatio.toFixed(1)),
      change,
    };
  };

  const p5m = calcPeriod(m5.volume, m5.buys, m5.sells, m5.priceChange || 0);
  const p1h = calcPeriod(h1.volume, h1.buys, h1.sells, h1.priceChange || 0);
  const p24h = calcPeriod(h24.volume, h24.buys, h24.sells, h24.priceChange || 0);

  const fmt = (n: number) => `$${Math.round(n).toLocaleString()}`;
  const fmtPct = (p: number) => `${p >= 0 ? '+' : ''}${p.toFixed(2)}%`;

  return `# ${name} ($${symbol})

- **Mint Address**: \`${mint}\`
- **Source URL**: ${sourceUrl}
- **Price USD**: $${priceUsd.toFixed(6)}
- **Market Cap**: ${fmt(marketCapUsd)}
- **Scraped Timestamp**: ${new Date().toISOString()}
- **Pipeline**: Scraped Data -> Formatted Markdown -> Parsed Volume Telemetry

---

## AMM Trading Volume & Transactions Telemetry

| Timeframe | Total Volume (USD) | Buy Volume (USD) | Sell Volume (USD) | Buy Txns | Sell Txns | Total Txns | Buy Ratio | Sell Ratio | Price Change |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **5M** | ${fmt(p5m.vol)} | ${fmt(p5m.buyVolume)} | ${fmt(p5m.sellVolume)} | ${p5m.buys.toLocaleString()} | ${p5m.sells.toLocaleString()} | ${p5m.totalTxs.toLocaleString()} | ${p5m.buyRatio}% | ${p5m.sellRatio}% | ${fmtPct(p5m.change)} |
| **1H** | ${fmt(p1h.vol)} | ${fmt(p1h.buyVolume)} | ${fmt(p1h.sellVolume)} | ${p1h.buys.toLocaleString()} | ${p1h.sells.toLocaleString()} | ${p1h.totalTxs.toLocaleString()} | ${p1h.buyRatio}% | ${p1h.sellRatio}% | ${fmtPct(p1h.change)} |
| **24H** | ${fmt(p24h.vol)} | ${fmt(p24h.buyVolume)} | ${fmt(p24h.sellVolume)} | ${p24h.buys.toLocaleString()} | ${p24h.sells.toLocaleString()} | ${p24h.totalTxs.toLocaleString()} | ${p24h.buyRatio}% | ${p24h.sellRatio}% | ${fmtPct(p24h.change)} |

---

## Transaction Analysis
- **5M Transactions**: ${p5m.totalTxs.toLocaleString()} trades (${p5m.buys.toLocaleString()} Buys / ${p5m.sells.toLocaleString()} Sells)
- **1H Transactions**: ${p1h.totalTxs.toLocaleString()} trades (${p1h.buys.toLocaleString()} Buys / ${p1h.sells.toLocaleString()} Sells)
- **24H Transactions**: ${p24h.totalTxs.toLocaleString()} trades (${p24h.buys.toLocaleString()} Buys / ${p24h.sells.toLocaleString()} Sells)
- **Net 24H Volume Flow**: ${p24h.buyVolume >= p24h.sellVolume ? '+' : ''}${fmt(p24h.buyVolume - p24h.sellVolume)} USD (${p24h.buyVolume >= p24h.sellVolume ? 'Net Buy Pressure' : 'Net Sell Pressure'})
`;
}

/**
 * Parses the Markdown document's table to extract exact 5M, 1H, and 24H volume,
 * buy volume, sell volume, and buy/sell transaction counts.
 */
export function parseVolumeFromMarkdown(markdown: string): MarkdownVolumeBreakdown {
  // Extract token title
  const titleMatch = markdown.match(/#\s+([^(]+?)\s*\(\$([^)]+)\)/);
  const tokenName = titleMatch ? titleMatch[1].trim() : 'Scraped Token';
  const tokenSymbol = titleMatch ? titleMatch[2].trim() : 'TOKEN';

  // Extract mint
  const mintMatch = markdown.match(/\*\*Mint Address\*\*:\s*`([^`]+)`/);
  const mint = mintMatch ? mintMatch[1].trim() : '';

  // Extract source
  const sourceMatch = markdown.match(/\*\*Source URL\*\*:\s*(\S+)/);
  const sourceUrl = sourceMatch ? sourceMatch[1].trim() : `https://pump.fun/coin/${mint}`;

  // Extract price
  const priceMatch = markdown.match(/\*\*Price USD\*\*:\s*\$([0-9.]+)/);
  const priceUsd = priceMatch ? parseFloat(priceMatch[1]) : 0.0001;

  // Extract market cap
  const mcMatch = markdown.match(/\*\*Market Cap\*\*:\s*\$([0-9,]+)/);
  const marketCapUsd = mcMatch ? parseFloat(mcMatch[1].replace(/,/g, '')) : priceUsd * 1_000_000_000;

  // Helper to parse numbers from strings like "$52,294" or "247"
  const parseNum = (str: string | undefined): number => {
    if (!str) return 0;
    const cleaned = str.replace(/[$,+%\s*]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  };

  const defaultMetrics = (vol = 0): VolumeMetrics => ({
    volumeUSD: vol,
    buyVolumeUSD: vol * 0.5,
    sellVolumeUSD: vol * 0.5,
    numBuys: 0,
    numSells: 0,
    numTxs: 0,
    buyRatio: 50,
    sellRatio: 50,
    priceChangePercent: 0,
  });

  const periods: MarkdownVolumeBreakdown['periods'] = {
    '5m': defaultMetrics(),
    '1h': defaultMetrics(),
    '24h': defaultMetrics(),
  };

  // Find table rows in Markdown
  const lines = markdown.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('|')) continue;
    const cells = trimmed.split('|').map((c) => c.trim()).filter(Boolean);
    if (cells.length < 8) continue;

    const tfRaw = cells[0].replace(/\*/g, '').toUpperCase();
    let tf: '5m' | '1h' | '24h' | null = null;
    if (tfRaw.includes('5M')) tf = '5m';
    else if (tfRaw.includes('1H')) tf = '1h';
    else if (tfRaw.includes('24H')) tf = '24h';

    if (tf) {
      const volUSD = parseNum(cells[1]);
      const buyVol = parseNum(cells[2]);
      const sellVol = parseNum(cells[3]);
      const buyTxns = Math.round(parseNum(cells[4]));
      const sellTxns = Math.round(parseNum(cells[5]));
      const totalTxns = Math.round(parseNum(cells[6])) || (buyTxns + sellTxns);
      const buyRatio = parseNum(cells[7]) || (totalTxns > 0 ? (buyTxns / totalTxns) * 100 : 50);
      const sellRatio = parseNum(cells[8]) || (100 - buyRatio);
      const priceChange = cells[9] ? parseNum(cells[9]) : 0;

      periods[tf] = {
        volumeUSD: volUSD,
        buyVolumeUSD: buyVol,
        sellVolumeUSD: sellVol,
        numBuys: buyTxns,
        numSells: sellTxns,
        numTxs: totalTxns,
        buyRatio,
        sellRatio,
        priceChangePercent: priceChange,
      };
    }
  }

  return {
    markdownText: markdown,
    tokenName,
    tokenSymbol,
    mint,
    sourceUrl,
    priceUsd,
    marketCapUsd,
    periods,
  };
}

/**
 * Converts raw HTML into a structured Markdown representation
 * for documents pasted or uploaded by the user.
 */
export function convertHtmlToMarkdown(html: string): string {
  if (typeof window === 'undefined' || !window.DOMParser) {
    return `# Scraped Document\n\n\`\`\`html\n${html.slice(0, 500)}\n\`\`\``;
  }

  try {
    const parser = new window.DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const title = doc.querySelector('title')?.textContent?.trim() || 'Scraped Token';
    const name = doc.querySelector('.token-title, h1')?.textContent?.trim() || title;
    const desc = doc.querySelector('.token-desc, p.description, meta[name="description"]')?.textContent?.trim() || '';
    const mint = doc.querySelector('meta[name="token-mint"]')?.getAttribute('content') || 'Unknown Mint';
    const sourceUrl = doc.querySelector('meta[name="token-source-url"]')?.getAttribute('content') || `https://pump.fun/coin/${mint}`;

    // Extract numbers from stat cards
    const v5m = doc.querySelector('[data-testid="volume-5m"] .val')?.textContent?.trim() || '$0';
    const v1h = doc.querySelector('[data-testid="volume-1h"] .val')?.textContent?.trim() || '$0';
    const v24h = doc.querySelector('[data-testid="volume-24h"] .val')?.textContent?.trim() || '$0';

    return `# ${name}

- **Mint Address**: \`${mint}\`
- **Source URL**: ${sourceUrl}
- **Description**: ${desc}

## AMM Trading Volume & Transactions Telemetry

| Timeframe | Total Volume (USD) | Buy Volume (USD) | Sell Volume (USD) | Buy Txns | Sell Txns | Total Txns | Buy Ratio | Sell Ratio | Price Change |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **5M** | ${v5m} | ${v5m} | $0 | 1 | 0 | 1 | 100% | 0% | +0.00% |
| **1H** | ${v1h} | ${v1h} | $0 | 1 | 0 | 1 | 100% | 0% | +0.00% |
| **24H** | ${v24h} | ${v24h} | $0 | 1 | 0 | 1 | 100% | 0% | +0.00% |
`;
  } catch {
    return `# Scraped Token\n\nRaw text conversion failed.`;
  }
}
