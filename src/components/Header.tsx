import React, { useState, useEffect, useRef } from 'react';
import {
  GraduationCap,
  Bell,
  User as UserIcon,
  LogOut,
  Plus,
  Compass,
  Calendar,
  Layers,
  LayoutDashboard,
  Check,
  CheckCheck,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { NotificationItem } from '../types';

interface HeaderProps {
  activeTab: 'dashboard' | 'explore' | 'my-groups' | 'schedule';
  setActiveTab: (tab: 'dashboard' | 'explore' | 'my-groups' | 'schedule') => void;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onOpenProfile: () => void;
  onOpenCreateGroup: () => void;
  onSelectGroupById?: (groupId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenLogin,
  onOpenRegister,
  onOpenProfile,
  onOpenCreateGroup,
  onSelectGroupById,
}) => {
  const { user, token, logout } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Poll notifications when user is logged in
  useEffect(() => {
    if (!token) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    const fetchNotifs = async () => {
      try {
        const data = await api.getNotifications(token);
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      } catch (err) {
        console.error('Failed to load notifications:', err);
      }
    };

    fetchNotifs();
    const interval = setInterval(fetchNotifs, 15000); // 15s refresh
    return () => clearInterval(interval);
  }, [token]);

  // Click outside to close notification dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkRead = async (id: string) => {
    if (!token) return;
    try {
      await api.markNotificationRead(id, token);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    if (!token) return;
    try {
      await api.markAllNotificationsRead(token);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Platform Name */}
          <div
            id="brand-logo"
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-3 cursor-pointer select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-sm shadow-indigo-200">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-zinc-900 block leading-tight">
                StudyHub
              </span>
              <span className="text-xs text-zinc-500 font-medium hidden sm:block">
                Campus Peer Learning Platform
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-zinc-100 p-1 rounded-xl">
            <button
              id="nav-tab-dashboard"
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </button>
            <button
              id="nav-tab-explore"
              onClick={() => setActiveTab('explore')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'explore'
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60'
              }`}
            >
              <Compass className="w-4 h-4" />
              Browse Groups
            </button>
            <button
              id="nav-tab-my-groups"
              onClick={() => setActiveTab('my-groups')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'my-groups'
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60'
              }`}
            >
              <Layers className="w-4 h-4" />
              My Groups
            </button>
            <button
              id="nav-tab-schedule"
              onClick={() => setActiveTab('schedule')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'schedule'
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Upcoming Sessions
            </button>
          </nav>

          {/* Right Action Cluster */}
          <div className="flex items-center gap-2.5">
            {/* Create Group Quick Button */}
            <button
              id="header-create-group-btn"
              onClick={() => {
                if (!user) {
                  onOpenLogin();
                } else {
                  onOpenCreateGroup();
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Create Group</span>
            </button>

            {/* Notifications Bell */}
            {user && (
              <div className="relative" ref={dropdownRef}>
                <button
                  id="notifications-bell-btn"
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 rounded-lg text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div
                    id="notifications-dropdown-menu"
                    className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white border border-zinc-200 shadow-lg py-2 z-50 animate-in fade-in-50 duration-100"
                  >
                    <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-100">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-zinc-900">Notifications</h4>
                        {unreadCount > 0 && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-medium">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          id="mark-all-read-btn"
                          onClick={handleMarkAllRead}
                          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                          Mark all as read
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-zinc-100">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-sm text-zinc-500">
                          No notifications yet. You will get alerts for new meetings and group activity.
                        </div>
                      ) : (
                        notifications.map(notif => (
                          <div
                            key={notif.id}
                            className={`p-3.5 transition-colors hover:bg-zinc-50 ${
                              !notif.isRead ? 'bg-indigo-50/50' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h5 className="text-xs font-semibold text-zinc-900">
                                  {notif.title}
                                </h5>
                                <p className="text-xs text-zinc-600 mt-0.5 leading-relaxed">
                                  {notif.message}
                                </p>
                                <span className="text-[10px] text-zinc-400 mt-1 block">
                                  {new Date(notif.createdAt).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                </span>
                              </div>
                              <div className="flex flex-col items-end gap-1 shrink-0">
                                {!notif.isRead && (
                                  <button
                                    onClick={() => handleMarkRead(notif.id)}
                                    title="Mark as read"
                                    className="text-zinc-400 hover:text-indigo-600 p-1"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                {notif.link && onSelectGroupById && (
                                  <button
                                    onClick={() => {
                                      const match = notif.link?.match(/\/groups\/(grp_[a-zA-Z0-9_]+)/);
                                      if (match && match[1]) {
                                        onSelectGroupById(match[1]);
                                        setShowNotifications(false);
                                      }
                                    }}
                                    className="text-[11px] text-indigo-600 hover:underline inline-flex items-center gap-0.5"
                                  >
                                    View <ExternalLink className="w-2.5 h-2.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Profile / Auth Action */}
            {user ? (
              <div className="flex items-center gap-2">
                <button
                  id="user-profile-chip"
                  onClick={onOpenProfile}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg border border-zinc-200 hover:border-zinc-300 bg-zinc-50 hover:bg-zinc-100 transition-colors text-left"
                >
                  <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-semibold overflow-hidden">
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      user.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="hidden sm:block">
                    <span className="text-xs font-semibold text-zinc-900 block leading-tight">
                      {user.name}
                    </span>
                    <span className="text-[10px] text-zinc-500 block leading-none">
                      {user.branch} • {user.semester}
                    </span>
                  </div>
                </button>
                <button
                  id="logout-btn"
                  onClick={logout}
                  title="Log out"
                  className="p-2 rounded-lg text-zinc-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  id="login-btn-header"
                  onClick={onOpenLogin}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                >
                  Log in
                </button>
                <button
                  id="register-btn-header"
                  onClick={onOpenRegister}
                  className="px-3.5 py-1.5 rounded-lg text-sm font-medium bg-zinc-900 hover:bg-zinc-800 text-white transition-colors"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Sub-Navigation */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-zinc-100 text-xs font-medium text-zinc-600">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center gap-1 ${
              activeTab === 'dashboard' ? 'text-indigo-600 font-semibold' : ''
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('explore')}
            className={`flex flex-col items-center gap-1 ${
              activeTab === 'explore' ? 'text-indigo-600 font-semibold' : ''
            }`}
          >
            <Compass className="w-4 h-4" />
            Groups
          </button>
          <button
            onClick={() => setActiveTab('my-groups')}
            className={`flex flex-col items-center gap-1 ${
              activeTab === 'my-groups' ? 'text-indigo-600 font-semibold' : ''
            }`}
          >
            <Layers className="w-4 h-4" />
            My Groups
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`flex flex-col items-center gap-1 ${
              activeTab === 'schedule' ? 'text-indigo-600 font-semibold' : ''
            }`}
          >
            <Calendar className="w-4 h-4" />
            Sessions
          </button>
        </div>
      </div>
    </header>
  );
};
