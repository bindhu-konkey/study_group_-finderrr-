import { Router, Response } from 'express';
import { db, MeetingRecord } from '../db.js';
import { authMiddleware, AuthRequest } from '../auth.js';

const router = Router();

// GET /api/meetings/upcoming - Get all upcoming meetings for user's joined groups
router.get('/upcoming', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const allGroups = db.getGroups();
    const userGroupIds = allGroups
      .filter(g => g.members.includes(req.user!.id))
      .map(g => g.id);

    const now = new Date().getTime();
    const allMeetings = db.getMeetings();

    const upcoming = allMeetings
      .filter(m => userGroupIds.includes(m.groupId))
      .filter(m => new Date(m.dateTime).getTime() >= now - 3600000) // include meetings ongoing in the last hour
      .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());

    return res.json({ meetings: upcoming });
  } catch (err: any) {
    console.error('Fetch upcoming meetings error:', err);
    return res.status(500).json({ error: 'Failed to fetch upcoming meetings.' });
  }
});

// GET /api/meetings/:id - Get single meeting details
router.get('/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  const meeting = db.findMeetingById(req.params.id);
  if (!meeting) {
    return res.status(404).json({ error: 'Meeting not found.' });
  }
  const group = db.findGroupById(meeting.groupId);
  return res.json({ meeting, group });
});

// POST /api/groups/:groupId/meetings - Schedule new meeting (creator of group)
router.post('/group/:groupId', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const group = db.findGroupById(req.params.groupId);
    if (!group) {
      return res.status(404).json({ error: 'Study group not found.' });
    }

    if (group.creatorId !== req.user.id) {
      return res.status(403).json({ error: 'Permission denied: Only the group creator can schedule meetings.' });
    }

    const {
      title,
      description,
      dateTime,
      durationMinutes,
      locationType,
      locationRoom,
      meetingUrl,
    } = req.body;

    if (!title || !dateTime) {
      return res.status(400).json({ error: 'Meeting title and date/time are required.' });
    }

    const parsedDate = new Date(dateTime);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date/time format.' });
    }

    const newMeeting: MeetingRecord = {
      id: 'mtg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      groupId: group.id,
      groupName: group.name,
      subject: group.subject,
      title: title.trim(),
      description: description ? description.trim() : '',
      dateTime: parsedDate.toISOString(),
      durationMinutes: durationMinutes ? parseInt(durationMinutes, 10) : 60,
      locationType: ['in-person', 'online', 'hybrid'].includes(locationType) ? locationType : group.format,
      locationRoom: locationRoom ? locationRoom.trim() : undefined,
      meetingUrl: meetingUrl ? meetingUrl.trim() : undefined,
      creatorId: req.user.id,
      createdAt: new Date().toISOString(),
    };

    db.createMeeting(newMeeting);

    // Notify all members of the group
    group.members.forEach(memberId => {
      db.addNotification({
        id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
        userId: memberId,
        title: `Session Scheduled: ${newMeeting.title}`,
        message: `${newMeeting.groupName} scheduled a session for ${new Date(newMeeting.dateTime).toLocaleString([], {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}.`,
        type: 'meeting',
        isRead: false,
        createdAt: new Date().toISOString(),
        link: `/groups/${group.id}`,
      });
    });

    return res.status(201).json({ meeting: newMeeting });
  } catch (err: any) {
    console.error('Create meeting error:', err);
    return res.status(500).json({ error: 'Failed to schedule meeting.' });
  }
});

// PUT /api/meetings/:id - Update meeting details
router.put('/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const meeting = db.findMeetingById(req.params.id);
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found.' });
    }

    const group = db.findGroupById(meeting.groupId);
    if (meeting.creatorId !== req.user.id && group?.creatorId !== req.user.id) {
      return res.status(403).json({ error: 'Permission denied: Only the organizer can update this meeting.' });
    }

    const {
      title,
      description,
      dateTime,
      durationMinutes,
      locationType,
      locationRoom,
      meetingUrl,
    } = req.body;

    const updates: Partial<MeetingRecord> = {};
    if (title) updates.title = title.trim();
    if (description !== undefined) updates.description = description.trim();
    if (dateTime) updates.dateTime = new Date(dateTime).toISOString();
    if (durationMinutes !== undefined) updates.durationMinutes = parseInt(durationMinutes, 10);
    if (locationType) updates.locationType = locationType;
    if (locationRoom !== undefined) updates.locationRoom = locationRoom.trim();
    if (meetingUrl !== undefined) updates.meetingUrl = meetingUrl.trim();

    const updated = db.updateMeeting(meeting.id, updates);

    // Notify group members of update
    if (group) {
      group.members.forEach(memberId => {
        if (memberId !== req.user!.id) {
          db.addNotification({
            id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
            userId: memberId,
            title: `Meeting Updated: ${updated?.title}`,
            message: `The schedule or venue for "${updated?.title}" was updated by ${req.user!.name}.`,
            type: 'meeting',
            isRead: false,
            createdAt: new Date().toISOString(),
            link: `/groups/${group.id}`,
          });
        }
      });
    }

    return res.json({ meeting: updated });
  } catch (err: any) {
    console.error('Update meeting error:', err);
    return res.status(500).json({ error: 'Failed to update meeting.' });
  }
});

// DELETE /api/meetings/:id - Delete meeting
router.delete('/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const meeting = db.findMeetingById(req.params.id);
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found.' });
    }

    const group = db.findGroupById(meeting.groupId);
    if (meeting.creatorId !== req.user.id && group?.creatorId !== req.user.id) {
      return res.status(403).json({ error: 'Permission denied: Only the organizer can cancel this meeting.' });
    }

    db.deleteMeeting(meeting.id);
    return res.json({ success: true, message: 'Meeting successfully cancelled.' });
  } catch (err: any) {
    console.error('Delete meeting error:', err);
    return res.status(500).json({ error: 'Failed to cancel meeting.' });
  }
});

export default router;
