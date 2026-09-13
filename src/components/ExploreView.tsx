import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Users,
  Compass,
  Plus,
  Sparkles,
  RotateCcw,
  Check,
} from 'lucide-react';
import { StudyGroup } from '../types';
import { GroupCard } from './GroupCard';

const SUBJECT_LIST = [
  'All Subjects',
  'Data Structures & Algorithms',
  'Artificial Intelligence',
  'Signals & Systems',
  'Thermodynamics',
  'Database Management Systems',
  'Operating Systems',
  'Computer Networks',
];

const BRANCH_LIST = [
  'All Branches',
  'Computer Science',
  'Information Technology',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Chemical Sciences',
];

const SEMESTER_LIST = [
  'All Semesters',
  '1st Semester',
  '2nd Semester',
  '3rd Semester',
  '4th Semester',
  '5th Semester',
  '6th Semester',
  '7th Semester',
  '8th Semester',
];

interface ExploreViewProps {
  groups: StudyGroup[];
  onViewDetails: (group: StudyGroup) => void;
  onJoinGroup: (group: StudyGroup) => void;
  onLeaveGroup: (group: StudyGroup) => void;
  onOpenCreateGroup: () => void;
  onOpenScheduleMeeting: (group: StudyGroup) => void;
  onOpenEditGroup: (group: StudyGroup) => void;
}

export const ExploreView: React.FC<ExploreViewProps> = ({
  groups,
  onViewDetails,
  onJoinGroup,
  onLeaveGroup,
  onOpenCreateGroup,
  onOpenScheduleMeeting,
  onOpenEditGroup,
}) => {
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All Subjects');
  const [selectedBranch, setSelectedBranch] = useState('All Branches');
  const [selectedSemester, setSelectedSemester] = useState('All Semesters');
  const [selectedFormat, setSelectedFormat] = useState('all');
  const [availableOnly, setAvailableOnly] = useState(false);

  const filteredGroups = useMemo(() => {
    return groups.filter(g => {
      // Search
      if (search.trim()) {
        const q = search.toLowerCase();
        const matches =
          g.name.toLowerCase().includes(q) ||
          g.subject.toLowerCase().includes(q) ||
          g.courseCode.toLowerCase().includes(q) ||
          g.description.toLowerCase().includes(q) ||
          g.creatorName.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Subject
      if (selectedSubject !== 'All Subjects' && g.subject !== selectedSubject) {
        return false;
      }

      // Branch
      if (selectedBranch !== 'All Branches' && g.branch !== selectedBranch) {
        return false;
      }

      // Semester
      if (selectedSemester !== 'All Semesters' && g.semester !== selectedSemester) {
        return false;
      }

      // Format
      if (selectedFormat !== 'all' && g.format !== selectedFormat) {
        return false;
      }

      // Available seats only
      if (availableOnly && g.members.length >= g.memberLimit) {
        return false;
      }

      return true;
    });
  }, [groups, search, selectedSubject, selectedBranch, selectedSemester, selectedFormat, availableOnly]);

  const resetFilters = () => {
    setSearch('');
    setSelectedSubject('All Subjects');
    setSelectedBranch('All Branches');
    setSelectedSemester('All Semesters');
    setSelectedFormat('all');
    setAvailableOnly(false);
  };

  const isFiltered =
    search ||
    selectedSubject !== 'All Subjects' ||
    selectedBranch !== 'All Branches' ||
    selectedSemester !== 'All Semesters' ||
    selectedFormat !== 'all' ||
    availableOnly;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Title & CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-900">
            Browse Study Groups
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Discover peer groups for your semester, check seat limits, and join sessions
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

      {/* Search & Filter Controls */}
      <div className="p-4 sm:p-5 bg-white rounded-2xl border border-zinc-200 shadow-xs space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />
          <input
            id="explore-search-input"
            type="text"
            placeholder="Search by subject, group title, course code (e.g. CS-301), or organizer..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
          />
        </div>

        {/* Multi-Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {/* Subject Filter */}
          <div>
            <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
              Subject
            </label>
            <select
              value={selectedSubject}
              onChange={e => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 bg-white font-medium text-zinc-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-600/20"
            >
              {SUBJECT_LIST.map(s => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Branch Filter */}
          <div>
            <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
              Branch
            </label>
            <select
              value={selectedBranch}
              onChange={e => setSelectedBranch(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 bg-white font-medium text-zinc-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-600/20"
            >
              {BRANCH_LIST.map(b => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Semester Filter */}
          <div>
            <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
              Semester
            </label>
            <select
              value={selectedSemester}
              onChange={e => setSelectedSemester(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 bg-white font-medium text-zinc-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-600/20"
            >
              {SEMESTER_LIST.map(sem => (
                <option key={sem} value={sem}>
                  {sem}
                </option>
              ))}
            </select>
          </div>

          {/* Meeting Format Filter */}
          <div>
            <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
              Format
            </label>
            <select
              value={selectedFormat}
              onChange={e => setSelectedFormat(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 bg-white font-medium text-zinc-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-600/20"
            >
              <option value="all">All Formats</option>
              <option value="in-person">In-Person Only</option>
              <option value="online">Online Only</option>
              <option value="hybrid">Hybrid Only</option>
            </select>
          </div>
        </div>

        {/* Bottom Filter Options: Available Seats Only Toggle & Reset */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-100 flex-wrap gap-3">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              id="filter-available-only-check"
              type="checkbox"
              checked={availableOnly}
              onChange={e => setAvailableOnly(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-zinc-300 accent-indigo-600"
            />
            <span className="text-xs font-semibold text-zinc-700">
              Only show groups with available seats (hide full)
            </span>
          </label>

          {isFiltered && (
            <button
              onClick={resetFilters}
              className="text-xs font-semibold text-zinc-500 hover:text-indigo-600 flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset All Filters
            </button>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-zinc-500 px-1">
        <span>
          Showing <span className="font-bold text-zinc-900">{filteredGroups.length}</span> study
          groups
        </span>
        {availableOnly && (
          <span className="text-emerald-600 font-medium">Filtering for open seats</span>
        )}
      </div>

      {/* Group Cards Grid */}
      {filteredGroups.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-zinc-200">
          <Compass className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-zinc-800">No study groups matched your filters</h4>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search criteria, clearing the filters, or create a new study group for
            this subject.
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <button
              onClick={resetFilters}
              className="px-3.5 py-1.5 rounded-lg border border-zinc-300 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
            >
              Reset Filters
            </button>
            <button
              onClick={onOpenCreateGroup}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white"
            >
              Create This Group
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGroups.map(group => (
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
