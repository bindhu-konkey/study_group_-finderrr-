import { Router, Response } from 'express';
import { db, GroupRecord } from '../db.js';
import { authMiddleware, optionalAuthMiddleware, AuthRequest, sanitizeUser } from '../auth.js';

const router = Router();

// GET /api/groups - List all groups with search and filter parameters
router.get('/', optionalAuthMiddleware, (req: AuthRequest, res: Response) => {
  try {
    let groups = db.getGroups();
    const {
      search,
      subject,
      branch,
      semester,
      format,
      availableOnly,
      myCreated,
      myJoined,
    } = req.query;

    const currentUserId = req.user?.id;

    // Filter by my created
    if (myCreated === 'true' && currentUserId) {
      groups = groups.filter(g => g.creatorId === currentUserId);
    }

    // Filter by my joined
    if (myJoined === 'true' && currentUserId) {
      groups = groups.filter(g => g.members.includes(currentUserId));
    }

    // Search query (matches name, subject, courseCode, description)
    if (typeof search === 'string' && search.trim()) {
      const q = search.trim().toLowerCase();
      groups = groups.filter(
        g =>
          g.name.toLowerCase().includes(q) ||
          g.subject.toLowerCase().includes(q) ||
          g.courseCode.toLowerCase().includes(q) ||
          g.description.toLowerCase().includes(q) ||
          g.creatorName.toLowerCase().includes(q)
      );
    }

    // Subject filter
    if (typeof subject === 'string' && subject.trim()) {
      const s = subject.trim().toLowerCase();
      groups = groups.filter(g => g.subject.toLowerCase() === s);
    }

    // Branch filter
    if (typeof branch === 'string' && branch.trim()) {
      const b = branch.trim().toLowerCase();
      groups = groups.filter(g => g.branch.toLowerCase() === b);
    }

    // Semester filter
    if (typeof semester === 'string' && semester.trim()) {
      const sem = semester.trim().toLowerCase();
      groups = groups.filter(g => g.semester.toLowerCase() === sem);
    }

    // Format filter
    if (typeof format === 'string' && format.trim() && format !== 'all') {
      groups = groups.filter(g => g.format === format);
    }

    // Available only filter (prevent joining if full)
    if (availableOnly === 'true') {
      groups = groups.filter(g => g.members.length < g.memberLimit);
    }

    // Attach next meeting and meeting count to each group
    const enrichedGroups = groups.map(g => {
      const meetings = db.getMeetingsByGroupId(g.id);
      const now = new Date().getTime();
      const upcomingMeetings = meetings.filter(m => new Date(m.dateTime).getTime() >= now);
      const nextMeeting = upcomingMeetings[0] || meetings[meetings.length - 1];

      return {
        ...g,
        meetingCount: meetings.length,
        nextMeeting: nextMeeting || null,
      };
    });

    return res.json({ groups: enrichedGroups });
  } catch (err: any) {
    console.error('Fetch groups error:', err);
    return res.status(500).json({ error: 'Failed to fetch groups.' });
  }
});

// GET /api/groups/:id - Single group details with members & meetings
router.get('/:id', optionalAuthMiddleware, (req: AuthRequest, res: Response) => {
  const group = db.findGroupById(req.params.id);
  if (!group) {
    return res.status(404).json({ error: 'Study group not found.' });
  }

  const meetings = db.getMeetingsByGroupId(group.id);
  const members = group.members
    .map(id => db.findUserById(id))
    .filter((u): u is NonNullable<typeof u> => Boolean(u))
    .map(sanitizeUser);

  return res.json({
    group: {
      ...group,
      meetingCount: meetings.length,
    },
    meetings,
    members,
  });
});

// POST /api/groups - Create a new study group (Team Member 2)
router.post('/', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { name, subject, courseCode, description, memberLimit, format, branch, semester } = req.body;

    if (!name || !subject || !courseCode || !description) {
      return res.status(400).json({ error: 'Name, subject, course code, and description are required.' });
    }

    const limit = parseInt(memberLimit, 10);
    if (isNaN(limit) || limit < 2 || limit > 50) {
      return res.status(400).json({ error: 'Member limit must be between 2 and 50 members.' });
    }

    const newGroup: GroupRecord = {
      id: 'grp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      name: name.trim(),
      subject: subject.trim(),
      courseCode: courseCode.trim().toUpperCase(),
      description: description.trim(),
      branch: branch ? branch.trim() : req.user.branch,
      semester: semester ? semester.trim() : req.user.semester,
      format: ['in-person', 'online', 'hybrid'].includes(format) ? format : 'hybrid',
      memberLimit: limit,
      creatorId: req.user.id,
      creatorName: req.user.name,
      members: [req.user.id], // Creator automatically joins as first member
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.createGroup(newGroup);

    // Add notification for creator
    db.addNotification({
      id: 'notif_' + Date.now(),
      userId: req.user.id,
      title: 'Study Group Created',
      message: `Your study group "${newGroup.name}" for ${newGroup.subject} has been created successfully.`,
      type: 'group',
      isRead: false,
      createdAt: new Date().toISOString(),
      link: `/groups/${newGroup.id}`,
    });

    return res.status(201).json({ group: newGroup });
  } catch (err: any) {
    console.error('Create group error:', err);
    return res.status(500).json({ error: 'Failed to create study group.' });
  }
});

// PUT /api/groups/:id - Edit group (creator only)
router.put('/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const group = db.findGroupById(req.params.id);
    if (!group) {
      return res.status(404).json({ error: 'Study group not found.' });
    }

    if (group.creatorId !== req.user.id) {
      return res.status(403).json({ error: 'Permission denied: Only the group creator can edit this group.' });
    }

    const { name, subject, courseCode, description, memberLimit, format, branch, semester } = req.body;

    const updates: Partial<GroupRecord> = {};
    if (name) updates.name = name.trim();
    if (subject) updates.subject = subject.trim();
    if (courseCode) updates.courseCode = courseCode.trim().toUpperCase();
    if (description) updates.description = description.trim();
    if (branch) updates.branch = branch.trim();
    if (semester) updates.semester = semester.trim();
    if (format && ['in-person', 'online', 'hybrid'].includes(format)) updates.format = format;

    if (memberLimit !== undefined) {
      const limit = parseInt(memberLimit, 10);
      if (isNaN(limit) || limit < group.members.length) {
        return res.status(400).json({
          error: `Member limit cannot be less than current member count (${group.members.length}).`,
        });
      }
      updates.memberLimit = limit;
    }

    const updated = db.updateGroup(group.id, updates);
    return res.json({ group: updated });
  } catch (err: any) {
    console.error('Update group error:', err);
    return res.status(500).json({ error: 'Failed to update study group.' });
  }
});

// DELETE /api/groups/:id - Delete group (creator only)
router.delete('/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const group = db.findGroupById(req.params.id);
    if (!group) {
      return res.status(404).json({ error: 'Study group not found.' });
    }

    if (group.creatorId !== req.user.id) {
      return res.status(403).json({ error: 'Permission denied: Only the group creator can delete this group.' });
    }

    // Notify other members
    group.members.forEach(memberId => {
      if (memberId !== req.user!.id) {
        db.addNotification({
          id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
          userId: memberId,
          title: 'Study Group Disbanded',
          message: `The study group "${group.name}" was disbanded by the creator.`,
          type: 'group',
          isRead: false,
          createdAt: new Date().toISOString(),
        });
      }
    });

    db.deleteGroup(group.id);
    return res.json({ success: true, message: 'Study group and associated meetings deleted.' });
  } catch (err: any) {
    console.error('Delete group error:', err);
    return res.status(500).json({ error: 'Failed to delete study group.' });
  }
});

// POST /api/groups/:id/join - Join group (Team Member 3)
router.post('/:id/join', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const group = db.findGroupById(req.params.id);
    if (!group) {
      return res.status(404).json({ error: 'Study group not found.' });
    }

    if (group.members.includes(req.user.id)) {
      return res.status(400).json({ error: 'You are already a member of this study group.' });
    }

    // CRITICAL: Prevent joining if group is full
    if (group.members.length >= group.memberLimit) {
      return res.status(400).json({
        error: `Group is full! Maximum limit of ${group.memberLimit} members reached.`,
      });
    }

    const updatedMembers = [...group.members, req.user.id];
    const updated = db.updateGroup(group.id, { members: updatedMembers });

    // Notify group creator
    if (group.creatorId !== req.user.id) {
      db.addNotification({
        id: 'notif_' + Date.now() + '_join',
        userId: group.creatorId,
        title: 'New Member Joined!',
        message: `${req.user.name} (${req.user.branch}, ${req.user.semester}) joined your study group "${group.name}".`,
        type: 'group',
        isRead: false,
        createdAt: new Date().toISOString(),
        link: `/groups/${group.id}`,
      });
    }

    // If reached full capacity, notify creator
    if (updatedMembers.length === group.memberLimit && group.creatorId !== req.user.id) {
      db.addNotification({
        id: 'notif_' + Date.now() + '_full',
        userId: group.creatorId,
        title: 'Group Is Now Full!',
        message: `"${group.name}" has reached its full capacity of ${group.memberLimit} members.`,
        type: 'group',
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }

    return res.json({
      success: true,
      message: 'Successfully joined study group.',
      group: updated,
    });
  } catch (err: any) {
    console.error('Join group error:', err);
    return res.status(500).json({ error: 'Failed to join group.' });
  }
});

// POST /api/groups/:id/leave - Leave group (Team Member 3)
router.post('/:id/leave', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const group = db.findGroupById(req.params.id);
    if (!group) {
      return res.status(404).json({ error: 'Study group not found.' });
    }

    if (!group.members.includes(req.user.id)) {
      return res.status(400).json({ error: 'You are not a member of this study group.' });
    }

    if (group.creatorId === req.user.id && group.members.length > 1) {
      // If creator leaves and there are other members, reassign creator to next member
      const remainingMembers = group.members.filter(id => id !== req.user!.id);
      const nextCreator = db.findUserById(remainingMembers[0]);
      const updated = db.updateGroup(group.id, {
        members: remainingMembers,
        creatorId: remainingMembers[0],
        creatorName: nextCreator ? nextCreator.name : 'Unknown',
      });
      return res.json({
        success: true,
        message: `You left the group. Ownership passed to ${nextCreator?.name || 'next member'}.`,
        group: updated,
      });
    }

    const updatedMembers = group.members.filter(id => id !== req.user!.id);
    const updated = db.updateGroup(group.id, { members: updatedMembers });

    return res.json({
      success: true,
      message: 'Successfully left study group.',
      group: updated,
    });
  } catch (err: any) {
    console.error('Leave group error:', err);
    return res.status(500).json({ error: 'Failed to leave group.' });
  }
});

export default router;
