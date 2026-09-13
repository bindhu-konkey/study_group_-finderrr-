import React, { useState, useEffect } from 'react';
import {
  X,
  Users,
  Calendar,
  Clock,
  MapPin,
  Video,
  Plus,
  Trash2,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Share2,
} from 'lucide-react';
import { StudyGroup, Meeting, User } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

interface GroupDetailModalProps {
  groupId: string | null;
  onClose: () => void;
  onJoinGroup: (group: StudyGroup) => void;
  onLeaveGroup: (group: StudyGroup) => void;
  onOpenScheduleMeeting: (group: StudyGroup) => void;
  onOpenEditGroup: (group: StudyGroup) => void;
}

export const GroupDetailModal: React.FC<GroupDetailModalProps> = ({
  groupId,
  onClose,
  onJoinGroup,
  onLeaveGroup,
  onOpenScheduleMeeting,
  onOpenEditGroup,
}) => {
  const { user, token } = useAuth();
  const [data, setData] = useState<{
    group: StudyGroup;
    meetings: Meeting[];
    members: User[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'sessions' | 'members'>('sessions');

  const fetchDetail = async () => {
    if (!groupId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.getGroupDetail(groupId, token);
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load group details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [groupId, token]);

  if (!groupId) return null;

  const group = data?.group;
  const isMember = user && group ? group.members.includes(user.id) : false;
  const isCreator = user && group ? group.creatorId === user.id : false;
  const isFull = group ? group.members.length >= group.memberLimit : false;
  const seatsLeft = group ? Math.max(0, group.memberLimit - group.members.length) : 0;

  const handleCancelMeeting = async (meetingId: string) => {
    if (!token) return;
    if (!window.confirm('Cancel this study session?')) return;
    try {
      await api.cancelMeeting(meetingId, token);
      fetchDetail();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel meeting');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/50 backdrop-blur-xs animate-in fade-in-50">
      <div
        id="group-detail-modal"
        className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-zinc-200 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-zinc-100 bg-zinc-50/50">
          <div className="flex-1 mr-4">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-indigo-100 text-indigo-800 uppercase">
                {group?.courseCode} • {group?.subject}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-zinc-200 text-zinc-700 font-medium capitalize">
                {group?.format}
              </span>
              {isCreator && (
                <span className="text-xs px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Group Lead
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-zinc-900">{group?.name || 'Loading...'}</h2>
            <p className="text-xs text-zinc-500 mt-1">
              Organized by {group?.creatorName} • {group?.branch} • {group?.semester}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {loading ? (
          <div className="p-12 text-center text-sm text-zinc-500">Loading group details...</div>
        ) : error || !group ? (
          <div className="p-8 text-center text-sm text-rose-600">
            {error || 'Study group could not be found.'}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Description */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                About this study group
              </h4>
              <p className="text-sm text-zinc-700 leading-relaxed bg-zinc-50 p-3.5 rounded-xl border border-zinc-100">
                {group.description}
              </p>
            </div>

            {/* Capacity & Membership Stats */}
            <div className="p-4 rounded-xl border border-zinc-200 bg-white shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm font-bold text-zinc-900">Seat Capacity & Status</span>
                </div>
                <div className="text-xs font-semibold">
                  <span className="text-zinc-900 font-bold">{group.members.length}</span>
                  <span className="text-zinc-500"> / {group.memberLimit} enrolled</span>
                  {isFull ? (
                    <span className="ml-2 text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full font-bold">
                      FULL
                    </span>
                  ) : (
                    <span className="ml-2 text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      {seatsLeft} seats left
                    </span>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-zinc-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    isFull ? 'bg-rose-500' : 'bg-indigo-600'
                  }`}
                  style={{
                    width: `${Math.min(100, (group.members.length / group.memberLimit) * 100)}%`,
                  }}
                />
              </div>
            </div>

            {/* Sub-tabs: Sessions vs Members */}
            <div>
              <div className="flex items-center justify-between border-b border-zinc-200 mb-4">
                <div className="flex gap-4">
                  <button
                    onClick={() => setActiveTab('sessions')}
                    className={`pb-2 text-sm font-semibold border-b-2 transition-colors ${
                      activeTab === 'sessions'
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-zinc-500 hover:text-zinc-800'
                    }`}
                  >
                    Study Sessions ({data?.meetings.length || 0})
                  </button>
                  <button
                    onClick={() => setActiveTab('members')}
                    className={`pb-2 text-sm font-semibold border-b-2 transition-colors ${
                      activeTab === 'members'
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-zinc-500 hover:text-zinc-800'
                    }`}
                  >
                    Members ({data?.members.length || 0})
                  </button>
                </div>

                {isCreator && activeTab === 'sessions' && (
                  <button
                    onClick={() => onOpenScheduleMeeting(group)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Schedule Meeting
                  </button>
                )}
              </div>

              {/* Sessions Tab */}
              {activeTab === 'sessions' && (
                <div className="space-y-3">
                  {!data?.meetings || data.meetings.length === 0 ? (
                    <div className="p-8 text-center rounded-xl bg-zinc-50 border border-dashed border-zinc-200 text-xs text-zinc-500">
                      No study sessions scheduled yet.
                      {isCreator && (
                        <div className="mt-2">
                          <button
                            onClick={() => onOpenScheduleMeeting(group)}
                            className="text-indigo-600 font-semibold hover:underline"
                          >
                            Schedule the first study session
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    data.meetings.map(m => {
                      const mDate = new Date(m.dateTime);
                      const isPast = mDate.getTime() < Date.now();

                      return (
                        <div
                          key={m.id}
                          className={`p-4 rounded-xl border transition-all ${
                            isPast
                              ? 'bg-zinc-50/70 border-zinc-200 opacity-80'
                              : 'bg-white border-zinc-200/90 shadow-xs hover:border-indigo-200'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 capitalize flex items-center gap-1">
                                  {m.locationType === 'online' ? (
                                    <Video className="w-3 h-3" />
                                  ) : (
                                    <MapPin className="w-3 h-3" />
                                  )}
                                  {m.locationType}
                                </span>
                                {isPast && (
                                  <span className="text-[10px] text-zinc-400 font-medium">
                                    Concluded
                                  </span>
                                )}
                              </div>
                              <h5 className="text-sm font-bold text-zinc-900">{m.title}</h5>
                              {m.description && (
                                <p className="text-xs text-zinc-600 mt-1">{m.description}</p>
                              )}
                            </div>

                            {isCreator && (
                              <button
                                onClick={() => handleCancelMeeting(m.id)}
                                title="Cancel session"
                                className="p-1 rounded text-zinc-400 hover:text-rose-600 hover:bg-rose-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>

                          {/* Time & Venue Information */}
                          <div className="mt-3 pt-2.5 border-t border-zinc-100 flex items-center justify-between flex-wrap gap-2 text-xs text-zinc-600">
                            <div className="flex items-center gap-3">
                              <span className="flex items-center gap-1 font-semibold text-zinc-900">
                                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                                {mDate.toLocaleDateString([], {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                                {mDate.toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}{' '}
                                ({m.durationMinutes} mins)
                              </span>
                            </div>

                            {/* Location / Meeting link */}
                            <div className="flex items-center gap-2">
                              {m.locationRoom && (
                                <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 text-[11px] font-medium">
                                  <MapPin className="w-3 h-3 text-zinc-500" />
                                  {m.locationRoom}
                                </span>
                              )}

                              {m.meetingUrl && (
                                <a
                                  href={m.meetingUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors"
                                >
                                  <Video className="w-3 h-3" />
                                  Join Session <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* Members Tab */}
              {activeTab === 'members' && (
                <div className="divide-y divide-zinc-100">
                  {data?.members.map(member => (
                    <div key={member.id} className="py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold overflow-hidden">
                          {member.avatarUrl ? (
                            <img
                              src={member.avatarUrl}
                              alt={member.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            member.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-zinc-900">{member.name}</span>
                            {member.id === group.creatorId && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-semibold">
                                Lead
                              </span>
                            )}
                            {user && member.id === user.id && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-600 font-medium">
                                You
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-zinc-500 block">
                            {member.branch} • {member.semester}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal Footer Actions */}
        {group && (
          <div className="p-4 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between gap-3">
            <div>
              {isCreator && (
                <button
                  onClick={() => {
                    onOpenEditGroup(group);
                    onClose();
                  }}
                  className="text-xs text-zinc-700 hover:text-zinc-900 font-semibold px-3 py-1.5 rounded-lg border border-zinc-300 hover:bg-white"
                >
                  Edit Group Settings
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-200/60 rounded-lg transition-colors"
              >
                Close
              </button>

              {isMember ? (
                <button
                  onClick={() => {
                    onLeaveGroup(group);
                    onClose();
                  }}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-zinc-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 border border-transparent text-zinc-800 transition-colors"
                >
                  Leave Study Group
                </button>
              ) : (
                <button
                  onClick={() => {
                    onJoinGroup(group);
                    onClose();
                  }}
                  disabled={isFull}
                  className={`px-5 py-2 text-xs font-semibold rounded-lg transition-colors shadow-xs ${
                    isFull
                      ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  {isFull ? 'Group Is Full' : 'Join This Group'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
