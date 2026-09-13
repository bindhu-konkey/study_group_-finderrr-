export interface User {
  id: string;
  name: string;
  email: string;
  branch: string;
  semester: string;
  bio?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface StudyGroup {
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
  members: string[]; // user IDs
  createdAt: string;
  updatedAt: string;
  meetingCount?: number;
  nextMeeting?: Meeting;
}

export interface Meeting {
  id: string;
  groupId: string;
  groupName: string;
  subject: string;
  title: string;
  description?: string;
  dateTime: string; // ISO string
  durationMinutes: number;
  locationType: 'in-person' | 'online' | 'hybrid';
  locationRoom?: string; // e.g. "Hall B, Room 204" or "Engineering Library"
  meetingUrl?: string; // e.g. Google Meet or Zoom URL
  creatorId: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'meeting' | 'group' | 'reminder' | 'system';
  isRead: boolean;
  createdAt: string;
  link?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface GroupFilterOptions {
  search?: string;
  subject?: string;
  branch?: string;
  semester?: string;
  format?: string;
  availableOnly?: boolean;
}
