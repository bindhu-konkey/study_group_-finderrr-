import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Video,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { StudyGroup, Meeting } from '../types';

interface ScheduleMeetingModalProps {
  isOpen: boolean;
  group: StudyGroup | null;
  onClose: () => void;
  onMeetingScheduled: (meeting: Meeting) => void;
}

export const ScheduleMeetingModal: React.FC<ScheduleMeetingModalProps> = ({
  isOpen,
  group,
  onClose,
  onMeetingScheduled,
}) => {
  const { token } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(() => {
    const tomorrow = new Date(Date.now() + 86400000);
    return tomorrow.toISOString().split('T')[0];
  });
  const [time, setTime] = useState('16:00');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [locationType, setLocationType] = useState<'in-person' | 'online' | 'hybrid'>('hybrid');
  const [locationRoom, setLocationRoom] = useState('Central Library - Discussion Room 2');
  const [meetingUrl, setMeetingUrl] = useState('https://meet.google.com/new');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !group) return null;

  const handleGenerateMeet = () => {
    const randomCode =
      Math.random().toString(36).substring(2, 5) +
      '-' +
      Math.random().toString(36).substring(2, 6) +
      '-' +
      Math.random().toString(36).substring(2, 5);
    setMeetingUrl(`https://meet.google.com/${randomCode}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setError(null);
    setLoading(true);

    try {
      const combinedDateTime = new Date(`${date}T${time}:00`).toISOString();
      const meeting = await api.scheduleMeeting(
        group.id,
        {
          title,
          description,
          dateTime: combinedDateTime,
          durationMinutes,
          locationType,
          locationRoom: locationType !== 'online' ? locationRoom : '',
          meetingUrl: locationType !== 'in-person' ? meetingUrl : '',
        },
        token
      );
      setLoading(false);
      onMeetingScheduled(meeting);
      onClose();
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Failed to schedule session');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/50 backdrop-blur-xs animate-in fade-in-50">
      <div
        id="schedule-meeting-modal"
        className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-zinc-200 overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
          <div>
            <h3 className="text-lg font-bold text-zinc-900">Schedule Study Session</h3>
            <p className="text-xs text-zinc-500">Group: {group.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                Session Topic / Title
              </label>
              <input
                id="meeting-title-input"
                type="text"
                required
                placeholder="e.g. Chapter 4 Practice Problems & Mock Quiz"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                Agenda / Topics to Cover <span className="text-zinc-400 font-normal">(Optional)</span>
              </label>
              <textarea
                rows={2}
                placeholder="What topics, problems, or notes should members prepare in advance?"
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full p-2.5 text-sm rounded-lg border border-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Date</label>
                <div className="relative">
                  <input
                    id="meeting-date-input"
                    type="date"
                    required
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Time</label>
                <input
                  id="meeting-time-input"
                  type="time"
                  required
                  value={time}
                  onChange={e => setTime(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Duration</label>
                <select
                  value={durationMinutes}
                  onChange={e => setDurationMinutes(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 bg-white"
                >
                  <option value={30}>30 mins</option>
                  <option value={45}>45 mins</option>
                  <option value={60}>60 mins (1 hr)</option>
                  <option value={90}>90 mins (1.5 hr)</option>
                  <option value={120}>120 mins (2 hr)</option>
                </select>
              </div>
            </div>

            {/* Session Type */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                Session Venue Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setLocationType('in-person')}
                  className={`py-2 px-2 text-xs font-medium rounded-lg border text-center transition-all ${
                    locationType === 'in-person'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold'
                      : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5 mx-auto mb-1" />
                  In-Person
                </button>
                <button
                  type="button"
                  onClick={() => setLocationType('online')}
                  className={`py-2 px-2 text-xs font-medium rounded-lg border text-center transition-all ${
                    locationType === 'online'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold'
                      : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                  }`}
                >
                  <Video className="w-3.5 h-3.5 mx-auto mb-1" />
                  Online
                </button>
                <button
                  type="button"
                  onClick={() => setLocationType('hybrid')}
                  className={`py-2 px-2 text-xs font-medium rounded-lg border text-center transition-all ${
                    locationType === 'hybrid'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold'
                      : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 mx-auto mb-1" />
                  Hybrid
                </button>
              </div>
            </div>

            {/* Location Room details if in-person or hybrid */}
            {locationType !== 'online' && (
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                  Classroom / Campus Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                  <input
                    id="meeting-location-input"
                    type="text"
                    required={locationType === 'in-person'}
                    placeholder="e.g. Science Complex Hall 204 or Library Pod 3B"
                    value={locationRoom}
                    onChange={e => setLocationRoom(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                  />
                </div>
              </div>
            )}

            {/* Online meeting link if online or hybrid */}
            {locationType !== 'in-person' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-zinc-700">
                    Google Meet / Zoom URL
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateMeet}
                    className="text-[11px] text-indigo-600 hover:underline font-semibold flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    Auto-Generate Room
                  </button>
                </div>
                <div className="relative">
                  <Video className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                  <input
                    id="meeting-url-input"
                    type="url"
                    required={locationType === 'online'}
                    placeholder="https://meet.google.com/abc-defg-hij"
                    value={meetingUrl}
                    onChange={e => setMeetingUrl(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 font-mono text-xs"
                  />
                </div>
              </div>
            )}

            <button
              id="submit-schedule-meeting-btn"
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? 'Scheduling...' : 'Confirm Session Schedule'}
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
