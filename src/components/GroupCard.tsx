import React from 'react';
import {
  Users,
  Calendar,
  Clock,
  MapPin,
  Video,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  Settings,
} from 'lucide-react';
import { StudyGroup } from '../types';
import { useAuth } from '../context/AuthContext';

interface GroupCardProps {
  group: StudyGroup;
  onViewDetails: (group: StudyGroup) => void;
  onJoinGroup: (group: StudyGroup) => void;
  onLeaveGroup: (group: StudyGroup) => void;
  onEditGroup?: (group: StudyGroup) => void;
  onScheduleMeeting?: (group: StudyGroup) => void;
}

export const GroupCard: React.FC<GroupCardProps> = ({
  group,
  onViewDetails,
  onJoinGroup,
  onLeaveGroup,
  onEditGroup,
  onScheduleMeeting,
}) => {
  const { user } = useAuth();

  const isMember = user ? group.members.includes(user.id) : false;
  const isCreator = user ? group.creatorId === user.id : false;
  const isFull = group.members.length >= group.memberLimit;
  const seatsLeft = Math.max(0, group.memberLimit - group.members.length);
  const capacityPercent = Math.min(100, Math.round((group.members.length / group.memberLimit) * 100));

  return (
    <div
      id={`group-card-${group.id}`}
      className="bg-white rounded-2xl border border-zinc-200/90 hover:border-zinc-300 transition-all hover:shadow-md flex flex-col justify-between overflow-hidden group"
    >
      {/* Card Header & Content */}
      <div className="p-5">
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 tracking-wide uppercase">
            {group.courseCode || 'COURSE'} • {group.subject}
          </span>
          <div className="flex items-center gap-1.5">
            <span
              className={`text-[11px] font-medium px-2 py-0.5 rounded-md capitalize flex items-center gap-1 ${
                group.format === 'online'
                  ? 'bg-blue-50 text-blue-700'
                  : group.format === 'in-person'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-purple-50 text-purple-700'
              }`}
            >
              {group.format === 'online' ? (
                <Video className="w-3 h-3" />
              ) : group.format === 'in-person' ? (
                <MapPin className="w-3 h-3" />
              ) : (
                <Sparkles className="w-3 h-3" />
              )}
              {group.format}
            </span>
          </div>
        </div>

        {/* Group Name & Description */}
        <h3
          onClick={() => onViewDetails(group)}
          className="text-base font-bold text-zinc-900 group-hover:text-indigo-600 transition-colors cursor-pointer line-clamp-1 mb-1.5"
        >
          {group.name}
        </h3>
        <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed mb-4">
          {group.description}
        </p>

        {/* Capacity Progress Bar */}
        <div className="mb-4 bg-zinc-50 p-3 rounded-xl border border-zinc-100">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-zinc-700 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-zinc-500" />
              Members
            </span>
            <div className="flex items-center gap-1">
              <span className="font-bold text-zinc-900">
                {group.members.length} / {group.memberLimit}
              </span>
              {isFull ? (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 ml-1">
                  FULL
                </span>
              ) : (
                <span className="text-[10px] font-semibold text-emerald-600 ml-1">
                  ({seatsLeft} open)
                </span>
              )}
            </div>
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-zinc-200 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isFull
                  ? 'bg-rose-500'
                  : capacityPercent > 80
                  ? 'bg-amber-500'
                  : 'bg-indigo-600'
              }`}
              style={{ width: `${capacityPercent}%` }}
            />
          </div>
        </div>

        {/* Next Meeting Banner (if scheduled) */}
        {group.nextMeeting ? (
          <div
            onClick={() => onViewDetails(group)}
            className="p-2.5 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-950 mb-2 cursor-pointer hover:bg-indigo-50 transition-colors"
          >
            <div className="flex items-center justify-between font-semibold text-[11px] text-indigo-700 mb-0.5">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Next Session
              </span>
              <span>
                {new Date(group.nextMeeting.dateTime).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
            <div className="font-medium text-xs truncate">{group.nextMeeting.title}</div>
            <div className="text-[11px] text-zinc-500 flex items-center gap-2 mt-1">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-zinc-400" />
                {new Date(group.nextMeeting.dateTime).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              {group.nextMeeting.locationRoom && (
                <span className="truncate flex items-center gap-0.5">
                  <MapPin className="w-3 h-3 text-zinc-400 shrink-0" />
                  {group.nextMeeting.locationRoom}
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="p-2 text-center rounded-xl bg-zinc-50 border border-zinc-100 text-[11px] text-zinc-400 mb-2">
            No upcoming session scheduled
          </div>
        )}

        {/* Creator Info */}
        <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-2 border-t border-zinc-100">
          <span className="truncate">
            Led by <span className="font-semibold text-zinc-700">{group.creatorName}</span>
            {isCreator && ' (You)'}
          </span>
          <span>{group.branch}</span>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="px-5 py-3.5 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between gap-2">
        <button
          onClick={() => onViewDetails(group)}
          className="text-xs font-semibold text-zinc-600 hover:text-zinc-900 transition-colors flex items-center gap-1 py-1"
        >
          Details
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center gap-1.5">
          {/* If Creator: Show Manage/Schedule quick actions */}
          {isCreator && onScheduleMeeting && (
            <button
              onClick={() => onScheduleMeeting(group)}
              className="px-2.5 py-1.5 rounded-lg bg-white border border-zinc-300 hover:bg-zinc-100 text-zinc-800 text-xs font-medium transition-colors"
            >
              + Session
            </button>
          )}

          {isCreator && onEditGroup && (
            <button
              onClick={() => onEditGroup(group)}
              title="Edit Group Details"
              className="p-1.5 rounded-lg bg-white border border-zinc-300 hover:bg-zinc-100 text-zinc-700 text-xs transition-colors"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Member Join / Leave State (Team Member 3) */}
          {isMember ? (
            <button
              onClick={() => onLeaveGroup(group)}
              className="px-3 py-1.5 rounded-lg bg-zinc-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 border border-transparent text-zinc-800 text-xs font-semibold transition-colors"
            >
              Joined (Leave)
            </button>
          ) : (
            <button
              onClick={() => onJoinGroup(group)}
              disabled={isFull}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-xs ${
                isFull
                  ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {isFull ? 'Group Full' : 'Join Group'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
