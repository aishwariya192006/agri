import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import Notification from '../models/Notification.js';

const router = Router();

/* GET /api/notifications — paginated list */
router.get('/', requireAuth, async (req, res) => {
  const { limit = 20, page = 1, type, unreadOnly } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const filter = { user: req.user.id, isDismissed: false };
  if (type)       filter.type    = type;
  if (unreadOnly) filter.isRead  = false;

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
    Notification.countDocuments(filter),
    Notification.countDocuments({ user: req.user.id, isRead: false, isDismissed: false }),
  ]);

  res.json({ notifications, total, unreadCount, page: Number(page), pages: Math.ceil(total / Number(limit)) });
});

/* GET /api/notifications/count — unread count only */
router.get('/count', requireAuth, async (req, res) => {
  const count = await Notification.countDocuments({ user: req.user.id, isRead: false, isDismissed: false });
  res.json({ count });
});

/* PATCH /api/notifications/:id/read */
router.patch('/:id/read', requireAuth, async (req, res) => {
  await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user.id }, { isRead: true });
  res.json({ success: true });
});

/* PATCH /api/notifications/read-all */
router.patch('/read-all', requireAuth, async (req, res) => {
  const { type } = req.body;
  const filter = { user: req.user.id, isRead: false };
  if (type) filter.type = type;
  const result = await Notification.updateMany(filter, { isRead: true });
  res.json({ success: true, updated: result.modifiedCount });
});

/* PATCH /api/notifications/:id/dismiss */
router.patch('/:id/dismiss', requireAuth, async (req, res) => {
  await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user.id }, { isDismissed: true });
  res.json({ success: true });
});

/* DELETE /api/notifications/clear — clear all dismissed */
router.delete('/clear', requireAuth, async (req, res) => {
  const result = await Notification.deleteMany({ user: req.user.id, isDismissed: true });
  res.json({ success: true, deleted: result.deletedCount });
});

/* POST /api/notifications — create system notification (admin use) */
router.post('/', requireAuth, async (req, res) => {
  const { type, title, message, severity, actionUrl, actionLabel, icon } = req.body;
  if (!type || !title || !message) return res.status(400).json({ error: 'type, title, message required' });

  const n = await Notification.create({
    user: req.user.id, type, title, message,
    severity: severity || 'low',
    actionUrl: actionUrl || '',
    actionLabel: actionLabel || 'View',
    icon: icon || '🔔',
  });
  res.status(201).json(n);
});

export default router;
