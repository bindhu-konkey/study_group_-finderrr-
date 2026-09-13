import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { ExploreView } from './components/ExploreView';
import { MyGroupsView } from './components/MyGroupsView';
import { UpcomingSessionsView } from './components/UpcomingSessionsView';
import { LoginModal, RegisterModal, ProfileModal } from './components/AuthModals';
import { CreateGroupModal } from './components/CreateGroupModal';
import { EditGroupModal } from './components/EditGroupModal';
import { ScheduleMeetingModal } from './components/ScheduleMeetingModal';
import { GroupDetailModal } from './components/GroupDetailModal';
import { api } from './api/client';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

function MainApp() {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Groups and meetings data
  const [groups, setGroups] = useState([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('all');

  // Modals state
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);

  // Active group selected for detail modal
  const [selectedGroupIdForDetail, setSelectedGroupIdForDetail] = useState(null);

  // Active group selected for edit
  const [groupToEdit, setGroupToEdit] = useState(null);

  // Active group selected for schedule
  const [groupToSchedule, setGroupToSchedule] = useState(null);

  // Toast notifications
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Fetch groups
  const loadGroups = useCallback(async () => {
    try {
      const data = await api.getGroups(undefined, token);
      setGroups(data);
    } catch (err) {
      console.error('Failed to load groups:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Fetch meetings
  const loadMeetings = useCallback(async () => {
    if (!token) {
      setUpcomingMeetings([]);
      return;
    }
    try {
      const data = await api.getUpcomingMeetings(token);
      setUpcomingMeetings(data);
    } catch (err) {
      console.error('Failed to load meetings:', err);
    }
  }, [token]);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  useEffect(() => {
    loadMeetings();
  }, [loadMeetings]);

  // Group Handlers
  const handleJoinGroup = async (group) => {
    if (!user || !token) {
      setIsLoginOpen(true);
      return;
    }

    if (group.members.length >= group.memberLimit) {
      showToast(`Cannot join: "${group.name}" is already at full capacity (${group.memberLimit}/${group.memberLimit} seats).`, 'error');
      return;
    }

    try {
      const updatedGroup = await api.joinGroup(group.id, token);
      setGroups(prev => prev.map(g => (g.id === updatedGroup.id ? updatedGroup : g)));
      showToast(`Successfully joined "${group.name}"!`);
      loadMeetings();
    } catch (err) {
      showToast(err.message || 'Failed to join group', 'error');
    }
  };

  const handleLeaveGroup = async (group) => {
    if (!user || !token) return;

    try {
      const updatedGroup = await api.leaveGroup(group.id, token);
      setGroups(prev => prev.map(g => (g.id === updatedGroup.id ? updatedGroup : g)));
      showToast(`You have left "${group.name}".`);
      loadMeetings();
    } catch (err) {
      showToast(err.message || 'Failed to leave group', 'error');
    }
  };

  const handleGroupCreated = (newGroup) => {
    setGroups(prev => [newGroup, ...prev]);
    showToast(`Study group "${newGroup.name}" created successfully!`);
    loadMeetings();
  };

  const handleGroupUpdated = (updatedGroup) => {
    setGroups(prev => prev.map(g => (g.id === updatedGroup.id ? updatedGroup : g)));
    showToast(`Study group "${updatedGroup.name}" updated successfully.`);
  };

  const handleGroupDeleted = (deletedId) => {
    setGroups(prev => prev.filter(g => g.id !== deletedId));
    showToast(`Study group has been deleted.`);
    loadMeetings();
  };

  const handleMeetingScheduled = (newMeeting) => {
    loadMeetings();
    loadGroups();
    showToast(`Study session "${newMeeting.title}" scheduled for ${new Date(newMeeting.dateTime).toLocaleDateString()}!`);
  };

  return (
    <div className="min-h-screen bg-zinc-100/70 text-zinc-900 flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* Toast Notification Popup */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-5 duration-200">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold ${
              toast.type === 'success'
                ? 'bg-zinc-900 text-white border-zinc-800'
                : 'bg-rose-600 text-white border-rose-700'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-white shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Main App Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenLogin={() => setIsLoginOpen(true)}
        onOpenRegister={() => setIsRegisterOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenCreateGroup={() => setIsCreateGroupOpen(true)}
        onSelectGroupById={groupId => setSelectedGroupIdForDetail(groupId)}
      />

      {/* Main Page Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {loading ? (
          <div className="p-20 text-center text-sm font-semibold text-zinc-400">
            Loading study platform data...
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <DashboardView
                groups={groups}
                upcomingMeetings={upcomingMeetings}
                searchQuery={searchQuery}
                setSearchQuery={q => {
                  setSearchQuery(q);
                  if (q) setActiveTab('explore');
                }}
                selectedBranch={selectedBranch}
                setSelectedBranch={b => {
                  setSelectedBranch(b);
                  if (b !== 'all') setActiveTab('explore');
                }}
                onViewDetails={group => setSelectedGroupIdForDetail(group.id)}
                onJoinGroup={handleJoinGroup}
                onLeaveGroup={handleLeaveGroup}
                onOpenCreateGroup={() => setIsCreateGroupOpen(true)}
                onOpenScheduleMeeting={group => setGroupToSchedule(group)}
                onOpenEditGroup={group => setGroupToEdit(group)}
                onNavigateTab={setActiveTab}
              />
            )}

            {activeTab === 'explore' && (
              <ExploreView
                groups={groups}
                onViewDetails={group => setSelectedGroupIdForDetail(group.id)}
                onJoinGroup={handleJoinGroup}
                onLeaveGroup={handleLeaveGroup}
                onOpenCreateGroup={() => setIsCreateGroupOpen(true)}
                onOpenScheduleMeeting={group => setGroupToSchedule(group)}
                onOpenEditGroup={group => setGroupToEdit(group)}
              />
            )}

            {activeTab === 'my-groups' && (
              <MyGroupsView
                groups={groups}
                onViewDetails={group => setSelectedGroupIdForDetail(group.id)}
                onJoinGroup={handleJoinGroup}
                onLeaveGroup={handleLeaveGroup}
                onOpenCreateGroup={() => setIsCreateGroupOpen(true)}
                onOpenScheduleMeeting={group => setGroupToSchedule(group)}
                onOpenEditGroup={group => setGroupToEdit(group)}
                onOpenLogin={() => setIsLoginOpen(true)}
                onNavigateExplore={() => setActiveTab('explore')}
              />
            )}

            {activeTab === 'schedule' && (
              <UpcomingSessionsView
                meetings={upcomingMeetings}
                groups={groups}
                onSelectGroup={group => setSelectedGroupIdForDetail(group.id)}
                onRefreshMeetings={loadMeetings}
                onOpenLogin={() => setIsLoginOpen(true)}
              />
            )}
          </>
        )}
      </main>

      {/* Modals */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSwitchToRegister={() => {
          setIsLoginOpen(false);
          setIsRegisterOpen(true);
        }}
      />

      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSwitchToLogin={() => {
          setIsRegisterOpen(false);
          setIsLoginOpen(true);
        }}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        createdCount={user ? groups.filter(g => g.creatorId === user.id).length : 0}
        joinedCount={user ? groups.filter(g => g.members.includes(user.id)).length : 0}
      />

      <CreateGroupModal
        isOpen={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
        onGroupCreated={handleGroupCreated}
      />

      <EditGroupModal
        isOpen={Boolean(groupToEdit)}
        group={groupToEdit}
        onClose={() => setGroupToEdit(null)}
        onGroupUpdated={handleGroupUpdated}
        onGroupDeleted={handleGroupDeleted}
      />

      <ScheduleMeetingModal
        isOpen={Boolean(groupToSchedule)}
        group={groupToSchedule}
        onClose={() => setGroupToSchedule(null)}
        onMeetingScheduled={handleMeetingScheduled}
      />

      <GroupDetailModal
        groupId={selectedGroupIdForDetail}
        onClose={() => setSelectedGroupIdForDetail(null)}
        onJoinGroup={handleJoinGroup}
        onLeaveGroup={handleLeaveGroup}
        onOpenScheduleMeeting={group => {
          setSelectedGroupIdForDetail(null);
          setGroupToSchedule(group);
        }}
        onOpenEditGroup={group => {
          setSelectedGroupIdForDetail(null);
          setGroupToEdit(group);
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
