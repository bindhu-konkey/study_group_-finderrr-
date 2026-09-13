import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  branch: string;
  semester: string;
  bio?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface GroupRecord {
  id: string;
  name: string;
  subject: string;
  courseCode: string;
  description: string;
  branch: string;
  semester: string;
  format: 'in-person' | 'online' | 'hybrid';
  memberLimit: number;
  creatorId: string;
  creatorName: string;
  members: string[]; // array of user IDs
  createdAt: string;
  updatedAt: string;
}

export interface MeetingRecord {
  id: string;
  groupId: string;
  groupName: string;
  subject: string;
  title: string;
  description?: string;
  dateTime: string; // ISO string
  durationMinutes: number;
  locationType: 'in-person' | 'online' | 'hybrid';
  locationRoom?: string;
  meetingUrl?: string;
  creatorId: string;
  createdAt: string;
}

export interface NotificationRecord {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'meeting' | 'group' | 'reminder' | 'system';
  isRead: boolean;
  createdAt: string;
  link?: string;
}

interface DatabaseSchema {
  users: UserRecord[];
  groups: GroupRecord[];
  meetings: MeetingRecord[];
  notifications: NotificationRecord[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

class Database {
  private data: DatabaseSchema = {
    users: [],
    groups: [],
    meetings: [],
    notifications: [],
  };

  constructor() {
    this.load();
  }

  private load() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } else {
        this.seedInitialData();
        this.save();
      }
    } catch (err) {
      console.error('Error loading database, seeding fallback:', err);
      this.seedInitialData();
    }
  }

  public save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  private seedInitialData() {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync('password123', salt);
    const now = new Date().toISOString();

    const user1: UserRecord = {
      id: 'usr_1',
      name: 'Alex Rivera',
      email: 'alex@university.edu',
      passwordHash: hash,
      branch: 'Computer Science',
      semester: '5th Semester',
      bio: 'Focused on algorithms, graph theory, and competitive programming.',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      createdAt: now,
    };

    const user2: UserRecord = {
      id: 'usr_2',
      name: 'Priya Sharma',
      email: 'priya@university.edu',
      passwordHash: hash,
      branch: 'Information Technology',
      semester: '4th Semester',
      bio: 'Loves deep learning, computer vision, and building ML models.',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      createdAt: now,
    };

    const user3: UserRecord = {
      id: 'usr_3',
      name: 'David Chen',
      email: 'david@university.edu',
      passwordHash: hash,
      branch: 'Electrical Engineering',
      semester: '6th Semester',
      bio: 'Studying digital signal processing and embedded IoT systems.',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      createdAt: now,
    };

    const user4: UserRecord = {
      id: 'usr_4',
      name: 'Maya Lin',
      email: 'maya@university.edu',
      passwordHash: hash,
      branch: 'Mechanical Engineering',
      semester: '3rd Semester',
      bio: 'Thermal engineering and CAD enthusiast. Preparing for mid-terms.',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      createdAt: now,
    };

    this.data.users = [user1, user2, user3, user4];

    // Groups
    const group1: GroupRecord = {
      id: 'grp_1',
      name: 'Algorithms & Dynamic Programming Lab',
      subject: 'Data Structures & Algorithms',
      courseCode: 'CS-301',
      description: 'Weekly deep-dives into dynamic programming, graphs, and greedy paradigms. We solve 3 hard problems per week together.',
      branch: 'Computer Science',
      semester: '5th Semester',
      format: 'hybrid',
      memberLimit: 6,
      creatorId: 'usr_1',
      creatorName: 'Alex Rivera',
      members: ['usr_1', 'usr_2', 'usr_3'],
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      updatedAt: now,
    };

    const group2: GroupRecord = {
      id: 'grp_2',
      name: 'Machine Learning & Neural Nets Circle',
      subject: 'Artificial Intelligence',
      courseCode: 'CS-402',
      description: 'Collaborative study group for Andrew Ng assignments, PyTorch implementations, and exam reviews.',
      branch: 'Computer Science',
      semester: '5th Semester',
      format: 'online',
      memberLimit: 8,
      creatorId: 'usr_2',
      creatorName: 'Priya Sharma',
      members: ['usr_2', 'usr_1', 'usr_4'],
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      updatedAt: now,
    };

    const group3: GroupRecord = {
      id: 'grp_3',
      name: 'Linear Systems & Fourier Transform',
      subject: 'Signals & Systems',
      courseCode: 'EE-204',
      description: 'Intensive practice for Fourier series, Laplace transforms, and continuous-time filter designs. All seats filled for upcoming quiz.',
      branch: 'Electrical Engineering',
      semester: '6th Semester',
      format: 'in-person',
      memberLimit: 4,
      creatorId: 'usr_3',
      creatorName: 'David Chen',
      members: ['usr_3', 'usr_1', 'usr_2', 'usr_4'], // 4/4 FULL!
      createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
      updatedAt: now,
    };

    const group4: GroupRecord = {
      id: 'grp_4',
      name: 'Fluid Mechanics & Thermodynamics',
      subject: 'Thermodynamics',
      courseCode: 'ME-305',
      description: 'Problem solving sessions on Rankine cycles, enthalpy calculations, and fluid dynamics simulations.',
      branch: 'Mechanical Engineering',
      semester: '3rd Semester',
      format: 'in-person',
      memberLimit: 5,
      creatorId: 'usr_4',
      creatorName: 'Maya Lin',
      members: ['usr_4'],
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      updatedAt: now,
    };

    const group5: GroupRecord = {
      id: 'grp_5',
      name: 'SQL Query Optimization & Database Internals',
      subject: 'Database Management Systems',
      courseCode: 'IT-310',
      description: 'Mastering indexing, B-trees, ACID compliance, and PostgreSQL query tuning before finals.',
      branch: 'Information Technology',
      semester: '4th Semester',
      format: 'hybrid',
      memberLimit: 10,
      creatorId: 'usr_2',
      creatorName: 'Priya Sharma',
      members: ['usr_2', 'usr_1'],
      createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      updatedAt: now,
    };

    this.data.groups = [group1, group2, group3, group4, group5];

    // Seed realistic upcoming meetings (within next 1 to 5 days)
    const tomorrow = new Date(Date.now() + 24 * 3600 * 1000);
    tomorrow.setHours(16, 0, 0, 0);

    const inTwoDays = new Date(Date.now() + 48 * 3600 * 1000);
    inTwoDays.setHours(18, 30, 0, 0);

    const inFourDays = new Date(Date.now() + 96 * 3600 * 1000);
    inFourDays.setHours(14, 0, 0, 0);

    const meeting1: MeetingRecord = {
      id: 'mtg_1',
      groupId: 'grp_1',
      groupName: 'Algorithms & Dynamic Programming Lab',
      subject: 'Data Structures & Algorithms',
      title: 'Graph Traversal & Dijkstra Algorithm Practice',
      description: 'Bring your laptops. We will code shortest path solutions in Python & C++ and do peer code reviews.',
      dateTime: tomorrow.toISOString(),
      durationMinutes: 90,
      locationType: 'hybrid',
      locationRoom: 'Campus Tech Library - Study Pod 3B',
      meetingUrl: 'https://meet.google.com/abc-defg-hij',
      creatorId: 'usr_1',
      createdAt: now,
    };

    const meeting2: MeetingRecord = {
      id: 'mtg_2',
      groupId: 'grp_2',
      groupName: 'Machine Learning & Neural Nets Circle',
      subject: 'Artificial Intelligence',
      title: 'Convolutional Neural Networks & Backprop Deep Dive',
      description: 'Reviewing matrix calculus for backpropagation and discussing ResNet architecture.',
      dateTime: inTwoDays.toISOString(),
      durationMinutes: 60,
      locationType: 'online',
      locationRoom: '',
      meetingUrl: 'https://meet.google.com/xyz-uvwx-rst',
      creatorId: 'usr_2',
      createdAt: now,
    };

    const meeting3: MeetingRecord = {
      id: 'mtg_3',
      groupId: 'grp_3',
      groupName: 'Linear Systems & Fourier Transform',
      subject: 'Signals & Systems',
      title: 'Mid-term Mock Quiz & Problem Set 4 Walkthrough',
      description: 'High priority review for quiz next week. Solving past 3 years test questions.',
      dateTime: inFourDays.toISOString(),
      durationMinutes: 120,
      locationType: 'in-person',
      locationRoom: 'Engineering Building Hall C, Room 210',
      meetingUrl: '',
      creatorId: 'usr_3',
      createdAt: now,
    };

    this.data.meetings = [meeting1, meeting2, meeting3];

    // Seed notifications
    this.data.notifications = [
      {
        id: 'notif_1',
        userId: 'usr_1',
        title: 'Upcoming Study Session Tomorrow',
        message: 'Graph Traversal & Dijkstra Algorithm Practice starts tomorrow at 4:00 PM in Library Pod 3B.',
        type: 'reminder',
        isRead: false,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        link: '/groups/grp_1',
      },
      {
        id: 'notif_2',
        userId: 'usr_1',
        title: 'New Meeting Scheduled',
        message: 'Priya Sharma scheduled "Convolutional Neural Networks" for Machine Learning Circle.',
        type: 'meeting',
        isRead: false,
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        link: '/groups/grp_2',
      },
      {
        id: 'notif_3',
        userId: 'usr_1',
        title: 'Group Capacity Reached',
        message: 'Linear Systems & Fourier Transform is now full (4/4 seats filled).',
        type: 'group',
        isRead: true,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        link: '/groups/grp_3',
      },
    ];
  }

  // --- Users ---
  public findUserById(id: string): UserRecord | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public findUserByEmail(email: string): UserRecord | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public createUser(user: UserRecord): UserRecord {
    this.data.users.push(user);
    this.save();
    return user;
  }

  public updateUser(id: string, updates: Partial<UserRecord>): UserRecord | undefined {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx === -1) return undefined;
    this.data.users[idx] = { ...this.data.users[idx], ...updates };
    this.save();
    return this.data.users[idx];
  }

  // --- Groups ---
  public getGroups(): GroupRecord[] {
    return [...this.data.groups];
  }

  public findGroupById(id: string): GroupRecord | undefined {
    return this.data.groups.find(g => g.id === id);
  }

  public createGroup(group: GroupRecord): GroupRecord {
    this.data.groups.unshift(group);
    this.save();
    return group;
  }

  public updateGroup(id: string, updates: Partial<GroupRecord>): GroupRecord | undefined {
    const idx = this.data.groups.findIndex(g => g.id === id);
    if (idx === -1) return undefined;
    this.data.groups[idx] = {
      ...this.data.groups[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.data.groups[idx];
  }

  public deleteGroup(id: string): boolean {
    const initialLen = this.data.groups.length;
    this.data.groups = this.data.groups.filter(g => g.id !== id);
    // Cascade delete meetings for this group
    this.data.meetings = this.data.meetings.filter(m => m.groupId !== id);
    this.save();
    return this.data.groups.length < initialLen;
  }

  // --- Meetings ---
  public getMeetings(): MeetingRecord[] {
    return [...this.data.meetings];
  }

  public getMeetingsByGroupId(groupId: string): MeetingRecord[] {
    return this.data.meetings
      .filter(m => m.groupId === groupId)
      .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
  }

  public findMeetingById(id: string): MeetingRecord | undefined {
    return this.data.meetings.find(m => m.id === id);
  }

  public createMeeting(meeting: MeetingRecord): MeetingRecord {
    this.data.meetings.push(meeting);
    this.save();
    return meeting;
  }

  public updateMeeting(id: string, updates: Partial<MeetingRecord>): MeetingRecord | undefined {
    const idx = this.data.meetings.findIndex(m => m.id === id);
    if (idx === -1) return undefined;
    this.data.meetings[idx] = { ...this.data.meetings[idx], ...updates };
    this.save();
    return this.data.meetings[idx];
  }

  public deleteMeeting(id: string): boolean {
    const initialLen = this.data.meetings.length;
    this.data.meetings = this.data.meetings.filter(m => m.id !== id);
    this.save();
    return this.data.meetings.length < initialLen;
  }

  // --- Notifications ---
  public getNotificationsForUser(userId: string): NotificationRecord[] {
    return this.data.notifications
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public addNotification(notification: NotificationRecord): NotificationRecord {
    this.data.notifications.unshift(notification);
    this.save();
    return notification;
  }

  public markNotificationRead(id: string, userId: string): boolean {
    const notif = this.data.notifications.find(n => n.id === id && n.userId === userId);
    if (notif) {
      notif.isRead = true;
      this.save();
      return true;
    }
    return false;
  }

  public markAllNotificationsRead(userId: string): void {
    this.data.notifications.forEach(n => {
      if (n.userId === userId) n.isRead = true;
    });
    this.save();
  }
}

export const db = new Database();
