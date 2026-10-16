import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // In-memory cache for high speed & zero rate-limiting issues
  const serverSearchCache = new Map<string, { data: any; timestamp: number }>();
  const serverMetaCache = new Map<string, { data: any; timestamp: number }>();
  const CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutes

  // Server-side proxy for Internet Archive Advanced Search
  app.get('/api/archive/search', async (req, res) => {
    const { q, rows = '24', page = '1', sort = 'downloads desc' } = req.query;
    const queryStr = (q as string) || 'mediatype:movies';
    const cacheKey = `${queryStr}|${rows}|${page}|${sort}`;

    const cached = serverSearchCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return res.json(cached.data);
    }

    try {
      const searchUrl = new URL('https://archive.org/advancedsearch.php');
      searchUrl.searchParams.set('q', queryStr);
      searchUrl.searchParams.append('fl[]', 'identifier');
      searchUrl.searchParams.append('fl[]', 'title');
      searchUrl.searchParams.append('fl[]', 'description');
      searchUrl.searchParams.append('fl[]', 'year');
      searchUrl.searchParams.append('fl[]', 'creator');
      searchUrl.searchParams.append('fl[]', 'downloads');
      searchUrl.searchParams.append('fl[]', 'mediatype');
      searchUrl.searchParams.append('fl[]', 'publicdate');
      searchUrl.searchParams.set('sort[]', sort as string);
      searchUrl.searchParams.set('rows', rows as string);
      searchUrl.searchParams.set('page', page as string);
      searchUrl.searchParams.set('output', 'json');

      const archiveRes = await fetch(searchUrl.toString(), {
        headers: {
          'User-Agent': 'CineArchive-App/1.0 (Public Domain Educational Streamer)'
        }
      });

      if (!archiveRes.ok) {
        return res.status(archiveRes.status).json({ error: 'Archive API responded with error' });
      }

      const data = await archiveRes.json();
      serverSearchCache.set(cacheKey, { data, timestamp: Date.now() });
      return res.json(data);
    } catch (err: any) {
      console.error('Server archive search proxy error:', err);
      return res.status(500).json({ error: err.message || 'Failed to proxy archive search' });
    }
  });

  // Server-side proxy for Internet Archive Item Metadata
  app.get('/api/archive/metadata/:identifier', async (req, res) => {
    const { identifier } = req.params;
    if (!identifier) {
      return res.status(400).json({ error: 'Missing identifier' });
    }

    const cached = serverMetaCache.get(identifier);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return res.json(cached.data);
    }

    try {
      const metaUrl = `https://archive.org/metadata/${encodeURIComponent(identifier)}`;
      const archiveRes = await fetch(metaUrl, {
        headers: {
          'User-Agent': 'CineArchive-App/1.0 (Public Domain Educational Streamer)'
        }
      });

      if (!archiveRes.ok) {
        return res.status(archiveRes.status).json({ error: 'Archive metadata error' });
      }

      const data = await archiveRes.json();
      serverMetaCache.set(identifier, { data, timestamp: Date.now() });
      return res.json(data);
    } catch (err: any) {
      console.error(`Server archive metadata proxy error for ${identifier}:`, err);
      return res.status(500).json({ error: err.message || 'Failed to proxy archive metadata' });
    }
  });

  // Check environment mode: Vite middleware in dev, static files in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CineArchive Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
