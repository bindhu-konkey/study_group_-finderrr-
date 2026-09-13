import React from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  ExternalLink,
  Users,
  Sparkles,
  Download,
  AlertCircle,
} from 'lucide-react';
import { Meeting, StudyGroup } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

interface UpcomingSessionsViewProps {
  meetings: Meeting[];
  groups: StudyGroup[];
  onSelectGroup: (group: StudyGroup) => void;
  onRefreshMeetings: () => void;
  onOpenLogin: () => void;
}

export const UpcomingSessionsView: React.FC<UpcomingSessionsViewProps> = ({
  meetings,
  groups,
  onSelectGroup,
  onRefreshMeetings,
  onOpenLogin,
}) => {
  const { user, token } = useAuth();

  if (!user) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-zinc-200 shadow-xs max-w-lg mx-auto my-12">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 font-bold">
          <Calendar className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900">Sign in to view your schedule</h2>
        <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
          See upcoming study sessions with classrooms, Google Meet links, and peer review schedules.
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

  const handleCancelMeeting = async (meetingId: string) => {
    if (!token) return;
    if (!window.confirm('Are you sure you want to cancel this study session?')) return;
    try {
      await api.cancelMeeting(meetingId, token);
      onRefreshMeetings();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel meeting');
    }
  };

  const handleDownloadIcs = (meeting: Meeting) => {
    const start = new Date(meeting.dateTime);
    const end = new Date(start.getTime() + meeting.durationMinutes * 60000);

    const formatDate = (date: Date) =>
      date.toISOString().replace(/-|:|\.\d+/g, '');

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//StudyHub//Campus Study Sessions//EN',
      'BEGIN:VEVENT',
      `SUMMARY:${meeting.title} - ${meeting.groupName}`,
      `DESCRIPTION:${meeting.description || 'Study session for ' + meeting.subject}`,
      `LOCATION:${meeting.locationRoom || meeting.meetingUrl || 'Campus'}`,
      `DTSTART:${formatDate(start)}`,
      `DTEND:${formatDate(end)}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${meeting.title.replace(/\s+/g, '_')}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-zinc-900">Upcoming Study Sessions</h1>
        <p className="text-xs text-zinc-500 mt-0.5">
          Review dates, access Google Meet/Zoom links, and check campus room assignments
        </p>
      </div>

      {meetings.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-zinc-200">
          <Calendar className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-zinc-800">No study sessions scheduled yet</h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
            Join study groups or schedule a new session from within a group you lead.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {meetings.map(meeting => {
            const meetingDate = new Date(meeting.dateTime);
            const parentGroup = groups.find(g => g.id === meeting.groupId);
            const isCreator = meeting.creatorId === user.id || parentGroup?.creatorId === user.id;

            return (
              <div
                key={meeting.id}
                className="bg-white rounded-2xl border border-zinc-200/90 shadow-xs hover:border-zinc-300 transition-all p-5 flex flex-col md:flex-row md:items-center justify-between gap-5"
              >
                {/* Left: Date Badge & Details */}
                <div className="flex items-start gap-4">
                  {/* Date Block */}
                  <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex flex-col items-center justify-center shrink-0 text-center">
                    <span className="text-[10px] uppercase font-bold text-indigo-700 tracking-wider">
                      {meetingDate.toLocaleDateString([], { month: 'short' })}
                    </span>
                    <span className="text-xl font-black text-indigo-950 leading-none">
                      {meetingDate.getDate()}
                    </span>
                    <span className="text-[9px] font-medium text-indigo-600 mt-0.5">
                      {meetingDate.toLocaleDateString([], { weekday: 'short' })}
                    </span>
                  </div>

                  {/* Info */}
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-800">
                        {meeting.groupName}
                      </span>
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                        {meeting.subject}
                      </span>
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600 capitalize">
                        {meeting.locationType}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-zinc-900">{meeting.title}</h3>
                    {meeting.description && (
                      <p className="text-xs text-zinc-600 mt-0.5 max-w-xl line-clamp-2">
                        {meeting.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-zinc-500 mt-2 flex-wrap">
                      <span className="flex items-center gap-1 font-semibold text-zinc-800">
                        <Clock className="w-3.5 h-3.5 text-zinc-400" />
                        {meetingDate.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        ({meeting.durationMinutes} minutes)
                      </span>

                      {meeting.locationRoom && (
                        <span className="flex items-center gap-1 text-zinc-700 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-rose-500" />
                          {meeting.locationRoom}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 self-end md:self-center shrink-0 flex-wrap">
                  {/* Direct Meet Link */}
                  {meeting.meetingUrl && (
                    <a
                      href={meeting.meetingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <Video className="w-4 h-4" />
                      Join Online Session <ExternalLink className="w-3 h-3" />
                    </a>
                  )}

                  {/* Add to calendar */}
                  <button
                    onClick={() => handleDownloadIcs(meeting)}
                    title="Export calendar event (.ics)"
                    className="p-2 rounded-xl border border-zinc-200 hover:bg-zinc-100 text-zinc-600 text-xs font-medium transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  {/* Group detail */}
                  {parentGroup && (
                    <button
                      onClick={() => onSelectGroup(parentGroup)}
                      className="px-3 py-2 rounded-xl border border-zinc-200 hover:bg-zinc-100 text-zinc-700 font-semibold text-xs transition-colors"
                    >
                      View Group
                    </button>
                  )}

                  {/* Cancel if creator */}
                  {isCreator && (
                    <button
                      onClick={() => handleCancelMeeting(meeting.id)}
                      className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
