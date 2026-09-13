import { StudyGroup, Meeting, NotificationItem, User, GroupFilterOptions } from '../types';

export const api = {
  // Groups
  async getGroups(filters?: GroupFilterOptions & { myCreated?: boolean; myJoined?: boolean }, token?: string | null): Promise<StudyGroup[]> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.subject && filters.subject !== 'all') params.append('subject', filters.subject);
    if (filters?.branch && filters.branch !== 'all') params.append('branch', filters.branch);
    if (filters?.semester && filters.semester !== 'all') params.append('semester', filters.semester);
    if (filters?.format && filters.format !== 'all') params.append('format', filters.format);
    if (filters?.availableOnly) params.append('availableOnly', 'true');
    if (filters?.myCreated) params.append('myCreated', 'true');
    if (filters?.myJoined) params.append('myJoined', 'true');

    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`/api/groups?${params.toString()}`, { headers });
    if (!res.ok) throw new Error('Failed to fetch study groups');
    const data = await res.json();
    return data.groups;
  },

  async getGroupDetail(id: string, token?: string | null): Promise<{
    group: StudyGroup;
    meetings: Meeting[];
    members: User[];
  }> {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`/api/groups/${id}`, { headers });
    if (!res.ok) throw new Error('Failed to fetch group details');
    return res.json();
  },

  async createGroup(data: Partial<StudyGroup>, token: string): Promise<StudyGroup> {
    const res = await fetch('/api/groups', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to create group');
    return result.group;
  },

  async updateGroup(id: string, data: Partial<StudyGroup>, token: string): Promise<StudyGroup> {
    const res = await fetch(`/api/groups/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to update group');
    return result.group;
  },

  async deleteGroup(id: string, token: string): Promise<void> {
    const res = await fetch(`/api/groups/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to delete group');
  },

  async joinGroup(id: string, token: string): Promise<StudyGroup> {
    const res = await fetch(`/api/groups/${id}/join`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to join group');
    return result.group;
  },

  async leaveGroup(id: string, token: string): Promise<StudyGroup> {
    const res = await fetch(`/api/groups/${id}/leave`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to leave group');
    return result.group;
  },

  // Meetings
  async getUpcomingMeetings(token: string): Promise<Meeting[]> {
    const res = await fetch('/api/meetings/upcoming', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch upcoming meetings');
    const data = await res.json();
    return data.meetings;
  },

  async scheduleMeeting(groupId: string, data: Partial<Meeting>, token: string): Promise<Meeting> {
    const res = await fetch(`/api/meetings/group/${groupId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to schedule meeting');
    return result.meeting;
  },

  async updateMeeting(id: string, data: Partial<Meeting>, token: string): Promise<Meeting> {
    const res = await fetch(`/api/meetings/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to update meeting');
    return result.meeting;
  },

  async cancelMeeting(id: string, token: string): Promise<void> {
    const res = await fetch(`/api/meetings/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to cancel meeting');
  },

  // Notifications
  async getNotifications(token: string): Promise<{ notifications: NotificationItem[]; unreadCount: number }> {
    const res = await fetch('/api/notifications', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch notifications');
    return res.json();
  },

  async markNotificationRead(id: string, token: string): Promise<void> {
    await fetch(`/api/notifications/${id}/read`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  async markAllNotificationsRead(token: string): Promise<void> {
    await fetch('/api/notifications/read-all', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};
