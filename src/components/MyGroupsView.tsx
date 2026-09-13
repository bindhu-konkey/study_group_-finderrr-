import React, { useState } from 'react';
import {
  Layers,
  Users,
  Plus,
  Settings,
  Calendar,
  ShieldCheck,
  ChevronRight,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import { StudyGroup } from '../types';
import { GroupCard } from './GroupCard';
import { useAuth } from '../context/AuthContext';

interface MyGroupsViewProps {
  groups: StudyGroup[];
  onViewDetails: (group: StudyGroup) => void;
  onJoinGroup: (group: StudyGroup) => void;
  onLeaveGroup: (group: StudyGroup) => void;
  onOpenCreateGroup: () => void;
  onOpenScheduleMeeting: (group: StudyGroup) => void;
  onOpenEditGroup: (group: StudyGroup) => void;
  onOpenLogin: () => void;
  onNavigateExplore: () => void;
}

export const MyGroupsView: React.FC<MyGroupsViewProps> = ({
  groups,
  onViewDetails,
  onJoinGroup,
  onLeaveGroup,
  onOpenCreateGroup,
  onOpenScheduleMeeting,
  onOpenEditGroup,
  onOpenLogin,
  onNavigateExplore,
}) => {
  const { user } = useAuth();
  const [subTab, setSubTab] = useState<'joined' | 'created'>('joined');

  if (!user) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-zinc-200 shadow-xs max-w-lg mx-auto my-12">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4 font-bold">
          <Layers className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900">Sign in to manage your study groups</h2>
        <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
          Create study squads for your subjects, view your memberships, and organize peer sessions.
        </p>
        <button
          onClick={onOpenLogin}
          className="mt-6 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors shadow-xs"
        >
          Sign In / Register
        </button>
      </div>
    );
  }

  const createdGroups = groups.filter(g => g.creatorId === user.id);
  const joinedGroups = groups.filter(g => g.members.includes(user.id));

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-900">My Study Groups</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Manage groups you organize and review groups you are enrolled in
          </p>
        </div>
        <button
          onClick={onOpenCreateGroup}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create New Group
        </button>
      </div>

      {/* Subtabs: Enrolled Groups vs Groups You Lead */}
      <div className="flex items-center gap-2 border-b border-zinc-200 pb-1">
        <button
          onClick={() => setSubTab('joined')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
            subTab === 'joined'
              ? 'bg-zinc-900 text-white'
              : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
          }`}
        >
          <Users className="w-4 h-4" />
          Enrolled Groups ({joinedGroups.length})
        </button>
        <button
          onClick={() => setSubTab('created')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
            subTab === 'created'
              ? 'bg-zinc-900 text-white'
              : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Groups I Lead ({createdGroups.length})
        </button>
      </div>

      {/* Content based on subTab */}
      {subTab === 'joined' ? (
        joinedGroups.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-zinc-200">
            <Layers className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-zinc-800">You haven't joined any groups yet</h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
              Browse groups matching your branch ({user.branch}) or semester ({user.semester}) to start studying with peers.
            </p>
            <button
              onClick={onNavigateExplore}
              className="mt-4 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white"
            >
              Browse Groups
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {joinedGroups.map(group => (
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
        )
      ) : createdGroups.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-zinc-200">
          <BookOpen className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-zinc-800">You haven't created any study groups</h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
            Take the initiative! Create a focused group for a tough course, set member limits, and host review sessions.
          </p>
          <button
            onClick={onOpenCreateGroup}
            className="mt-4 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white"
          >
            Create Your First Group
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {createdGroups.map(group => (
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
  );
};
