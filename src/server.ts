import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import {join} from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

const TROY_OUNCE_GRAMS = 31.1034768;

interface CachedRatesPayload {
  goldRate24k: number;
  goldRate22k: number;
  silverRate: number;
  xauUsd: number;
  xagUsd: number;
  usdInr: number;
  updatedAt: string;
}

let ratesCache: { data: CachedRatesPayload; expiresAt: number } | null = null;

app.get('/api/rates', async (_req, res) => {
  try {
    const now = Date.now();
    if (ratesCache && ratesCache.expiresAt > now) {
      res.json(ratesCache.data);
      return;
    }

    const [xauRes, xagRes, fxRes] = await Promise.all([
      fetch('https://api.gold-api.com/price/XAU', { signal: AbortSignal.timeout(6000) }),
      fetch('https://api.gold-api.com/price/XAG', { signal: AbortSignal.timeout(6000) }),
      fetch('https://open.er-api.com/v6/latest/USD', { signal: AbortSignal.timeout(6000) })
    ]);

    if (!xauRes.ok || !xagRes.ok || !fxRes.ok) {
      throw new Error('Upstream bullion or FX provider returned non-200 status');
    }

    const [xauJson, xagJson, fxJson] = (await Promise.all([
      xauRes.json(),
      xagRes.json(),
      fxRes.json()
    ])) as [
      { price?: number; updatedAt?: string },
      { price?: number; updatedAt?: string },
      { rates?: { INR?: number } }
    ];

    const xauUsd = Number(xauJson?.price);
    const xagUsd = Number(xagJson?.price);
    const usdInr = Number(fxJson?.rates?.INR);

    if (!Number.isFinite(xauUsd) || !Number.isFinite(xagUsd) || !Number.isFinite(usdInr) || xauUsd <= 0 || usdInr <= 0) {
      throw new Error('Invalid bullion or FX rate payload');
    }

    const gold24kRaw = (xauUsd / TROY_OUNCE_GRAMS) * usdInr;
    const goldRate24k = Math.round(gold24kRaw);
    const goldRate22k = Math.round(gold24kRaw * (22 / 24));
    const silverRate = Number(((xagUsd / TROY_OUNCE_GRAMS) * usdInr).toFixed(2));

    const payload: CachedRatesPayload = {
      goldRate24k,
      goldRate22k,
      silverRate,
      xauUsd: Number(xauUsd.toFixed(2)),
      xagUsd: Number(xagUsd.toFixed(2)),
      usdInr: Number(usdInr.toFixed(2)),
      updatedAt: xauJson?.updatedAt || new Date().toISOString()
    };

    ratesCache = {
      data: payload,
      expiresAt: now + 60_000
    };

    res.json(payload);
  } catch (error) {
    console.error('Failed to fetch live bullion rates:', error);
    if (ratesCache) {
      res.json(ratesCache.data);
      return;
    }
    res.status(502).json({ error: 'Unable to fetch real-time gold and silver rates' });
  }
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
