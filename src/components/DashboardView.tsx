import React from 'react';
import {
  Users,
  Calendar,
  Layers,
  Search,
  Video,
  MapPin,
  Clock,
  Plus,
  ArrowRight,
  Sparkles,
  BookOpen,
  Filter,
  CheckCircle2,
} from 'lucide-react';
import { StudyGroup, Meeting } from '../types';
import { GroupCard } from './GroupCard';
import { useAuth } from '../context/AuthContext';

interface DashboardViewProps {
  groups: StudyGroup[];
  upcomingMeetings: Meeting[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedBranch: string;
  setSelectedBranch: (b: string) => void;
  onViewDetails: (group: StudyGroup) => void;
  onJoinGroup: (group: StudyGroup) => void;
  onLeaveGroup: (group: StudyGroup) => void;
  onOpenCreateGroup: () => void;
  onOpenScheduleMeeting: (group: StudyGroup) => void;
  onOpenEditGroup: (group: StudyGroup) => void;
  onNavigateTab: (tab: 'dashboard' | 'explore' | 'my-groups' | 'schedule') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  groups,
  upcomingMeetings,
  searchQuery,
  setSearchQuery,
  selectedBranch,
  setSelectedBranch,
  onViewDetails,
  onJoinGroup,
  onLeaveGroup,
  onOpenCreateGroup,
  onOpenScheduleMeeting,
  onOpenEditGroup,
  onNavigateTab,
}) => {
  const { user } = useAuth();

  const joinedGroups = user ? groups.filter(g => g.members.includes(user.id)) : [];
  const ledGroups = user ? groups.filter(g => g.creatorId === user.id) : [];

  // Next meeting among user's joined groups
  const nextMeeting = upcomingMeetings.length > 0 ? upcomingMeetings[0] : null;

  // Filter groups for search/branch
  const filteredGroups = groups.filter(g => {
    const matchesSearch =
      !searchQuery ||
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.courseCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBranch = !selectedBranch || selectedBranch === 'all' || g.branch === selectedBranch;
    return matchesSearch && matchesBranch;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-800 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Peer-to-Peer Study Hub
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome{user ? `, ${user.name.split(' ')[0]}` : ''}! Study better, together.
            </h1>
            <p className="text-zinc-300 text-sm mt-2 leading-relaxed">
              Find campus study groups for your courses, schedule review sessions with Google Meet & classroom locations, and collaborate before exams.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 shrink-0">
            <button
              onClick={onOpenCreateGroup}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Study Group
            </button>
            <button
              onClick={() => onNavigateTab('explore')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2"
            >
              Browse All Groups
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Highlighted Next Session Banner */}
        {nextMeeting && (
          <div className="mt-6 pt-6 border-t border-white/10 bg-white/5 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center font-bold shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                    Next Study Session
                  </span>
                  <span className="text-[11px] text-zinc-400">
                    {new Date(nextMeeting.dateTime).toLocaleDateString([], {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}{' '}
                    at{' '}
                    {new Date(nextMeeting.dateTime).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <h4 className="text-base font-bold text-white mt-0.5">{nextMeeting.title}</h4>
                <div className="flex items-center gap-3 text-xs text-zinc-300 mt-1">
                  <span>Group: {nextMeeting.groupName}</span>
                  {nextMeeting.locationRoom && (
                    <span className="flex items-center gap-1 text-zinc-400">
                      <MapPin className="w-3.5 h-3.5" />
                      {nextMeeting.locationRoom}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {nextMeeting.meetingUrl && (
                <a
                  href={nextMeeting.meetingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Video className="w-3.5 h-3.5" />
                  Join Google Meet
                </a>
              )}
              <button
                onClick={() => onNavigateTab('schedule')}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs"
              >
                All Sessions
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Metrics Row (Team Member 5) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-zinc-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-zinc-500">Available Groups</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-zinc-900">{groups.length}</span>
          <span className="text-[11px] text-zinc-500 block mt-1">Active on campus</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-zinc-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-zinc-500">My Memberships</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-zinc-900">{joinedGroups.length}</span>
          <span className="text-[11px] text-zinc-500 block mt-1">Groups joined</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-zinc-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-zinc-500">Groups I Lead</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-zinc-900">{ledGroups.length}</span>
          <span className="text-[11px] text-zinc-500 block mt-1">Created by you</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-zinc-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-zinc-500">Upcoming Sessions</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-zinc-900">
            {upcomingMeetings.length}
          </span>
          <span className="text-[11px] text-zinc-500 block mt-1">Scheduled across groups</span>
        </div>
      </div>

      {/* Quick Search & Filter Header (Team Member 5) */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-zinc-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />
            <input
              id="dashboard-search-input"
              type="text"
              placeholder="Search by subject (e.g. Data Structures), course code (CS-301), or topic..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedBranch}
              onChange={e => setSelectedBranch(e.target.value)}
              className="px-3 py-2.5 text-sm rounded-xl border border-zinc-300 bg-white font-medium text-zinc-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-600/20"
            >
              <option value="all">All Academic Branches</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Electrical Engineering">Electrical Engineering</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
            </select>
          </div>
        </div>

        {/* Quick subject pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-zinc-400 font-semibold uppercase text-[10px] tracking-wider shrink-0">
            Popular:
          </span>
          {[
            'Data Structures & Algorithms',
            'Artificial Intelligence',
            'Signals & Systems',
            'Thermodynamics',
            'Database Management Systems',
          ].map(subj => (
            <button
              key={subj}
              onClick={() => setSearchQuery(searchQuery === subj ? '' : subj)}
              className={`px-3 py-1 rounded-full shrink-0 font-medium transition-colors border ${
                searchQuery === subj
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200'
              }`}
            >
              {subj}
            </button>
          ))}
        </div>
      </div>

      {/* Featured / Explore Study Groups Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-zinc-900">Recommended Study Groups</h2>
            <p className="text-xs text-zinc-500">
              {filteredGroups.length} groups found • Join with open seats
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('explore')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            View All Groups <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {filteredGroups.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-zinc-200">
            <Layers className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-zinc-700">No study groups match your search.</p>
            <p className="text-xs text-zinc-500 mt-1">Try resetting the filters or create a new group!</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedBranch('all');
              }}
              className="mt-3 px-3.5 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-xs font-semibold text-zinc-700"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredGroups.slice(0, 6).map(group => (
              <GroupCard
                key={group.id}
                group={group}
                onViewDetails={onViewDetails}
                onJoinGroup={onJoinGroup}
                onLeaveGroup={onLeaveGroup}
                onEditGroup={onOpenEditGroup}
                onScheduleMeeting={onOpenScheduleMeeting}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
