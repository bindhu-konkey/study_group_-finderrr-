import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { StudyGroup } from '../types';

interface EditGroupModalProps {
  isOpen: boolean;
  group: StudyGroup | null;
  onClose: () => void;
  onGroupUpdated: (group: StudyGroup) => void;
  onGroupDeleted: (groupId: string) => void;
}

export const EditGroupModal: React.FC<EditGroupModalProps> = ({
  isOpen,
  group,
  onClose,
  onGroupUpdated,
  onGroupDeleted,
}) => {
  const { token } = useAuth();
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [description, setDescription] = useState('');
  const [memberLimit, setMemberLimit] = useState(6);
  const [format, setFormat] = useState<'in-person' | 'online' | 'hybrid'>('hybrid');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (group) {
      setName(group.name);
      setSubject(group.subject);
      setCourseCode(group.courseCode);
      setDescription(group.description);
      setMemberLimit(group.memberLimit);
      setFormat(group.format);
      setError(null);
      setShowDeleteConfirm(false);
    }
  }, [group]);

  if (!isOpen || !group) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setError(null);
    setLoading(true);

    try {
      const updated = await api.updateGroup(
        group.id,
        {
          name,
          subject,
          courseCode: courseCode.trim().toUpperCase(),
          description,
          memberLimit,
          format,
        },
        token
      );
      setLoading(false);
      onGroupUpdated(updated);
      onClose();
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Failed to update group');
    }
  };

  const handleDelete = async () => {
    if (!token) return;
    setLoading(true);
    try {
      await api.deleteGroup(group.id, token);
      setLoading(false);
      onGroupDeleted(group.id);
      onClose();
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Failed to delete group');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/50 backdrop-blur-xs animate-in fade-in-50">
      <div
        id="edit-group-modal"
        className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-zinc-200 overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
          <div>
            <h3 className="text-lg font-bold text-zinc-900">Manage Study Group</h3>
            <p className="text-xs text-zinc-500">Edit details or adjust member limit</p>
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
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Group Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Course Code</label>
                <input
                  type="text"
                  required
                  value={courseCode}
                  onChange={e => setCourseCode(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 uppercase"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Description</label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full p-2.5 text-sm rounded-lg border border-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Member Limit (Min: {group.members.length})
                </label>
                <input
                  type="number"
                  min={group.members.length}
                  max={50}
                  value={memberLimit}
                  onChange={e => setMemberLimit(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Meeting Format</label>
                <select
                  value={format}
                  onChange={e => setFormat(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 bg-white"
                >
                  <option value="hybrid">Hybrid</option>
                  <option value="in-person">In-person</option>
                  <option value="online">Online</option>
                </select>
              </div>
            </div>

            <div className="pt-3 flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-lg border border-zinc-300 text-zinc-700 text-xs font-semibold hover:bg-zinc-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold disabled:opacity-60"
              >
                {loading ? 'Saving Changes...' : 'Save Updates'}
              </button>
            </div>
          </form>

          {/* Delete Danger Zone */}
          <div className="mt-6 pt-5 border-t border-zinc-100">
            {!showDeleteConfirm ? (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                Disband & Delete Study Group
              </button>
            ) : (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
                <p className="text-xs text-rose-800 font-medium mb-2">
                  Are you sure? This will delete the group and cancel all scheduled meetings.
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-3 py-1.5 text-xs bg-white border border-zinc-300 text-zinc-700 rounded-md font-semibold"
                  >
                    Keep Group
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={loading}
                    className="px-3 py-1.5 text-xs bg-rose-600 hover:bg-rose-700 text-white rounded-md font-semibold disabled:opacity-60"
                  >
                    Confirm Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
