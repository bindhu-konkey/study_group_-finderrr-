import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { db, UserRecord } from '../db.js';
import { authMiddleware, AuthRequest, generateToken, sanitizeUser } from '../auth.js';

const router = Router();

// POST /api/auth/register
router.post('/register', (req, res) => {
  try {
    const { name, email, password, branch, semester, bio } = req.body;

    if (!name || !email || !password || !branch || !semester) {
      return res.status(400).json({ error: 'Name, email, password, branch, and semester are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const existing = db.findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const newUser: UserRecord = {
      id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      branch: branch.trim(),
      semester: semester.trim(),
      bio: bio ? bio.trim() : undefined,
      createdAt: new Date().toISOString(),
    };

    db.createUser(newUser);

    // Add welcome notification
    db.addNotification({
      id: 'notif_' + Date.now(),
      userId: newUser.id,
      title: 'Welcome to Study Hub!',
      message: `Welcome, ${newUser.name}! Discover groups in ${newUser.branch} or create your own study group.`,
      type: 'system',
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    const token = generateToken(newUser);
    return res.status(201).json({
      token,
      user: sanitizeUser(newUser),
    });
  } catch (err: any) {
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = db.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isValid = bcrypt.compareSync(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken(user);
    return res.json({
      token,
      user: sanitizeUser(user),
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, (req: AuthRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  return res.json({ user: sanitizeUser(req.user) });
});

// PUT /api/auth/profile
router.put('/profile', authMiddleware, (req: AuthRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { name, branch, semester, bio, avatarUrl } = req.body;

  const updates: Partial<UserRecord> = {};
  if (name) updates.name = name.trim();
  if (branch) updates.branch = branch.trim();
  if (semester) updates.semester = semester.trim();
  if (bio !== undefined) updates.bio = bio.trim();
  if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl.trim();

  const updatedUser = db.updateUser(req.user.id, updates);
  if (!updatedUser) {
    return res.status(404).json({ error: 'User not found' });
  }

  const token = generateToken(updatedUser);
  return res.json({
    token,
    user: sanitizeUser(updatedUser),
  });
});

// GET /api/auth/users - lookup public profiles for group members
router.get('/users', (req, res) => {
  const ids = typeof req.query.ids === 'string' ? req.query.ids.split(',') : [];
  if (ids.length > 0) {
    const users = ids
      .map(id => db.findUserById(id.trim()))
      .filter((u): u is UserRecord => Boolean(u))
      .map(sanitizeUser);
    return res.json({ users });
  }
  return res.json({ users: [] });
});

export default router;
