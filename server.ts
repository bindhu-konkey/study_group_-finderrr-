import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import authRoutes from './server/routes/authRoutes.js';
import groupRoutes from './server/routes/groupRoutes.js';
import meetingRoutes from './server/routes/meetingRoutes.js';
import notificationRoutes from './server/routes/notificationRoutes.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parser middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API Routes FIRST
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/groups', groupRoutes);
  app.use('/api/meetings', meetingRoutes);
  app.use('/api/notifications', notificationRoutes);

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Study Group Platform server running on http://localhost:${PORT}`);
  });
}

startServer();
