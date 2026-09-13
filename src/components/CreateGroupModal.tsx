import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Users,
  Layers,
  MapPin,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { StudyGroup } from '../types';

const COMMON_SUBJECTS = [
  'Data Structures & Algorithms',
  'Artificial Intelligence',
  'Signals & Systems',
  'Thermodynamics',
  'Database Management Systems',
  'Operating Systems',
  'Computer Networks',
  'Calculus & Linear Algebra',
  'Software Engineering',
];

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGroupCreated: (group: StudyGroup) => void;
}

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  isOpen,
  onClose,
  onGroupCreated,
}) => {
  const { user, token } = useAuth();
  const [name, setName] = useState('');
  const [subject, setSubject] = useState(COMMON_SUBJECTS[0]);
  const [customSubject, setCustomSubject] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [description, setDescription] = useState('');
  const [memberLimit, setMemberLimit] = useState(6);
  const [format, setFormat] = useState<'in-person' | 'online' | 'hybrid'>('hybrid');
  const [branch, setBranch] = useState(user?.branch || 'Computer Science');
  const [semester, setSemester] = useState(user?.semester || '5th Semester');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError('Please log in first');
      return;
    }
    setError(null);
    setLoading(true);

    const chosenSubject = subject === 'Other' ? customSubject.trim() : subject;
    if (!chosenSubject) {
      setError('Subject is required');
      setLoading(false);
      return;
    }

    try {
      const created = await api.createGroup(
        {
          name,
          subject: chosenSubject,
          courseCode: courseCode.trim().toUpperCase(),
          description,
          memberLimit,
          format,
          branch,
          semester,
        },
        token
      );
      setLoading(false);
      onGroupCreated(created);
      onClose();
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Failed to create group');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/50 backdrop-blur-xs animate-in fade-in-50">
      <div
        id="create-group-modal"
        className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-zinc-200 overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
          <div>
            <h3 className="text-lg font-bold text-zinc-900">Create Study Group</h3>
            <p className="text-xs text-zinc-500">
              Gather peers, establish member limits, and schedule study sessions
            </p>
          </div>
          <button
            id="close-create-group-modal-btn"
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
                Group Name
              </label>
              <input
                id="group-name-input"
                type="text"
                required
                placeholder="e.g. Graph Theory & Dynamic Programming Lab"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Subject</label>
                <select
                  id="group-subject-select"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 bg-white"
                >
                  {COMMON_SUBJECTS.map(s => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                  <option value="Other">Other (Custom Subject)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                  Course Code
                </label>
                <input
                  id="group-coursecode-input"
                  type="text"
                  required
                  placeholder="e.g. CS-301"
                  value={courseCode}
                  onChange={e => setCourseCode(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 uppercase"
                />
              </div>
            </div>

            {subject === 'Other' && (
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Custom Subject Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter subject name"
                  value={customSubject}
                  onChange={e => setCustomSubject(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                Description & Study Objectives
              </label>
              <textarea
                id="group-desc-input"
                rows={3}
                required
                placeholder="What will your group focus on? (e.g. solving problem sets, mid-term revision, coding interview prep)"
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full p-2.5 text-sm rounded-lg border border-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                  Member Limit <span className="text-zinc-500 font-normal">(Capacity)</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    id="group-limit-range"
                    type="range"
                    min={2}
                    max={20}
                    value={memberLimit}
                    onChange={e => setMemberLimit(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                  <span className="w-10 text-center text-sm font-bold text-indigo-600 bg-indigo-50 py-1 rounded-md border border-indigo-100">
                    {memberLimit}
                  </span>
                </div>
                <span className="text-[10px] text-zinc-400 mt-1 block">
                  Prevents overcrowding to ensure focused discussions.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                  Meeting Format
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['hybrid', 'in-person', 'online'] as const).map(fmt => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setFormat(fmt)}
                      className={`py-2 px-1 text-xs capitalize rounded-lg font-medium border text-center transition-all ${
                        format === fmt
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold'
                          : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              id="submit-create-group-btn"
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? 'Creating Group...' : 'Create Study Group'}
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
