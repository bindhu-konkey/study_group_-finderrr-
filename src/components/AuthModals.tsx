import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  User as UserIcon,
  GraduationCap,
  BookOpen,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const BRANCH_OPTIONS = [
  'Computer Science',
  'Information Technology',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Chemical Sciences',
  'Biotechnology',
  'Business & Management',
  'Mathematics & Physics',
];

const SEMESTER_OPTIONS = [
  '1st Semester',
  '2nd Semester',
  '3rd Semester',
  '4th Semester',
  '5th Semester',
  '6th Semester',
  '7th Semester',
  '8th Semester',
];

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSwitchToRegister }) => {
  const { login, demoLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (res.success) {
      onClose();
    } else {
      setError(res.error || 'Failed to log in');
    }
  };

  const handleQuickDemo = async (demoEmail: string) => {
    setError(null);
    setLoading(true);
    const ok = await demoLogin(demoEmail);
    setLoading(false);
    if (ok) {
      onClose();
    } else {
      setError('Demo login failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/50 backdrop-blur-xs animate-in fade-in-50">
      <div
        id="login-modal-box"
        className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-zinc-200 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
          <div>
            <h3 className="text-lg font-bold text-zinc-900">Student Sign In</h3>
            <p className="text-xs text-zinc-500">Access study groups, meetings, and materials</p>
          </div>
          <button
            id="close-login-btn"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                University Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                <input
                  id="login-email-input"
                  type="email"
                  required
                  placeholder="student@university.edu"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                <input
                  id="login-password-input"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                />
              </div>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* 1-Click Demo Profiles */}
          <div className="mt-6 pt-5 border-t border-zinc-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                Quick 1-Click Test Accounts:
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('alex@university.edu')}
                className="text-left p-2 rounded-lg border border-zinc-200 hover:border-indigo-300 hover:bg-indigo-50/40 transition-all text-xs"
              >
                <div className="font-semibold text-zinc-900">Alex Rivera</div>
                <div className="text-[10px] text-zinc-500">CS • 5th Sem (Leader)</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('priya@university.edu')}
                className="text-left p-2 rounded-lg border border-zinc-200 hover:border-indigo-300 hover:bg-indigo-50/40 transition-all text-xs"
              >
                <div className="font-semibold text-zinc-900">Priya Sharma</div>
                <div className="text-[10px] text-zinc-500">IT • 4th Sem (ML Club)</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('david@university.edu')}
                className="text-left p-2 rounded-lg border border-zinc-200 hover:border-indigo-300 hover:bg-indigo-50/40 transition-all text-xs"
              >
                <div className="font-semibold text-zinc-900">David Chen</div>
                <div className="text-[10px] text-zinc-500">EE • 6th Sem</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('maya@university.edu')}
                className="text-left p-2 rounded-lg border border-zinc-200 hover:border-indigo-300 hover:bg-indigo-50/40 transition-all text-xs"
              >
                <div className="font-semibold text-zinc-900">Maya Lin</div>
                <div className="text-[10px] text-zinc-500">ME • 3rd Sem</div>
              </button>
            </div>
          </div>

          {/* Switch to register */}
          <div className="mt-4 text-center text-xs text-zinc-600">
            Don't have an account?{' '}
            <button
              id="switch-to-register-btn"
              type="button"
              onClick={onSwitchToRegister}
              className="text-indigo-600 font-semibold hover:underline"
            >
              Register here
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({
  isOpen,
  onClose,
  onSwitchToLogin,
}) => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [branch, setBranch] = useState(BRANCH_OPTIONS[0]);
  const [semester, setSemester] = useState(SEMESTER_OPTIONS[4]); // default 5th
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    const res = await register({
      name,
      email,
      password,
      branch,
      semester,
      bio,
    });
    setLoading(false);
    if (res.success) {
      onClose();
    } else {
      setError(res.error || 'Registration failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/50 backdrop-blur-xs animate-in fade-in-50">
      <div
        id="register-modal-box"
        className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-zinc-200 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
          <div>
            <h3 className="text-lg font-bold text-zinc-900">Create Student Account</h3>
            <p className="text-xs text-zinc-500">Join campus study groups and collaborate with peers</p>
          </div>
          <button
            id="close-register-btn"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                <input
                  id="reg-name-input"
                  type="text"
                  required
                  placeholder="e.g. Jordan Miller"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                University Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                <input
                  id="reg-email-input"
                  type="email"
                  required
                  placeholder="jordan@university.edu"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                <input
                  id="reg-password-input"
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                  Academic Branch
                </label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                  <select
                    id="reg-branch-select"
                    value={branch}
                    onChange={e => setBranch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 bg-white"
                  >
                    {BRANCH_OPTIONS.map(b => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Semester</label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                  <select
                    id="reg-semester-select"
                    value={semester}
                    onChange={e => setSemester(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 bg-white"
                  >
                    {SEMESTER_OPTIONS.map(s => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                Study Bio / Interests <span className="text-zinc-400 font-normal">(Optional)</span>
              </label>
              <textarea
                id="reg-bio-input"
                rows={2}
                placeholder="What topics or exams are you preparing for?"
                value={bio}
                onChange={e => setBio(e.target.value)}
                className="w-full p-2.5 text-sm rounded-lg border border-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
              />
            </div>

            <button
              id="register-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-semibold shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? 'Creating Account...' : 'Complete Registration'}
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-4 text-center text-xs text-zinc-600">
            Already registered?{' '}
            <button
              id="switch-to-login-btn"
              type="button"
              onClick={onSwitchToLogin}
              className="text-indigo-600 font-semibold hover:underline"
            >
              Log in to your account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  createdCount: number;
  joinedCount: number;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  createdCount,
  joinedCount,
}) => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [branch, setBranch] = useState(user?.branch || BRANCH_OPTIONS[0]);
  const [semester, setSemester] = useState(user?.semester || SEMESTER_OPTIONS[0]);
  const [bio, setBio] = useState(user?.bio || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  if (!isOpen || !user) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const res = await updateProfile({ name, branch, semester, bio });
    setLoading(false);
    if (res.success) {
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
      setIsEditing(false);
    } else {
      setMessage({ text: res.error || 'Failed to update profile', type: 'error' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/50 backdrop-blur-xs animate-in fade-in-50">
      <div
        id="profile-modal-box"
        className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-zinc-200 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
          <h3 className="text-lg font-bold text-zinc-900">Student Profile</h3>
          <button
            id="close-profile-btn"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Card */}
        <div className="p-6">
          {message && (
            <div
              className={`mb-4 p-3 rounded-lg text-xs flex items-center gap-2 ${
                message.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {!isEditing ? (
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xl font-bold overflow-hidden shadow-sm">
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
                <div>
                  <h4 className="text-lg font-bold text-zinc-900">{user.name}</h4>
                  <p className="text-xs text-zinc-500">{user.email}</p>
                  <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-semibold">
                      {user.branch}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 font-medium">
                      {user.semester}
                    </span>
                  </div>
                </div>
              </div>

              {user.bio && (
                <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100 text-xs text-zinc-600 leading-relaxed">
                  <span className="font-semibold text-zinc-800 block mb-0.5">Study Focus:</span>
                  {user.bio}
                </div>
              )}

              {/* Statistics Grid */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/80 text-center">
                  <span className="text-2xl font-black text-indigo-600 block leading-tight">
                    {joinedCount}
                  </span>
                  <span className="text-xs text-zinc-500 font-medium">Active Groups Joined</span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/80 text-center">
                  <span className="text-2xl font-black text-zinc-900 block leading-tight">
                    {createdCount}
                  </span>
                  <span className="text-xs text-zinc-500 font-medium">Study Groups Led</span>
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  id="edit-profile-btn"
                  onClick={() => {
                    setName(user.name);
                    setBranch(user.branch);
                    setSemester(user.semester);
                    setBio(user.bio || '');
                    setIsEditing(true);
                  }}
                  className="flex-1 py-2 rounded-lg border border-zinc-300 hover:bg-zinc-50 text-zinc-700 text-xs font-semibold transition-colors"
                >
                  Edit Profile
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Academic Branch
                </label>
                <select
                  value={branch}
                  onChange={e => setBranch(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 bg-white"
                >
                  {BRANCH_OPTIONS.map(b => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Semester</label>
                <select
                  value={semester}
                  onChange={e => setSemester(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 bg-white"
                >
                  {SEMESTER_OPTIONS.map(s => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Bio</label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  className="w-full p-2.5 text-sm rounded-lg border border-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-2 rounded-lg border border-zinc-300 text-zinc-700 text-xs font-semibold hover:bg-zinc-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold disabled:opacity-60"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
