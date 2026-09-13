import { Router, Response } from 'express';
import { db } from '../db.js';
import { authMiddleware, AuthRequest } from '../auth.js';

const router = Router();

// GET /api/notifications
router.get('/', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const notifications = db.getNotificationsForUser(req.user.id);
    const unreadCount = notifications.filter(n => !n.isRead).length;

    return res.json({ notifications, unreadCount });
  } catch (err: any) {
    console.error('Fetch notifications error:', err);
    return res.status(500).json({ error: 'Failed to fetch notifications.' });
  }
});

// POST /api/notifications/:id/read
router.post('/:id/read', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const success = db.markNotificationRead(req.params.id, req.user.id);
    return res.json({ success });
  } catch (err: any) {
    console.error('Mark notification read error:', err);
    return res.status(500).json({ error: 'Failed to update notification.' });
  }
});

// POST /api/notifications/read-all
router.post('/read-all', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    db.markAllNotificationsRead(req.user.id);
    return res.json({ success: true });
  } catch (err: any) {
    console.error('Mark all read error:', err);
    return res.status(500).json({ error: 'Failed to mark all as read.' });
  }
});

export default router;
