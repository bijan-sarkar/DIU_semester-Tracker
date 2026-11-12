import React, { useState, useEffect } from 'react';
import { Topic } from '../types';
import { X, Save, BookOpen, Sparkles } from 'lucide-react';

interface TopicNotesModalProps {
  topic: Topic | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveNotes: (topicId: string, notes: string) => Promise<void>;
}

export const TopicNotesModal: React.FC<TopicNotesModalProps> = ({
  topic,
  isOpen,
  onClose,
  onSaveNotes,
}) => {
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (topic) {
      setNotes(topic.notes || '');
    }
  }, [topic]);

  if (!isOpen || !topic) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSaveNotes(topic.id, notes);
      onClose();
    } catch (err) {
      console.error('Failed to save notes', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl glass-card rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-slide-up">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                {topic.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Personal Revision Notes & Formula Sheet
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {topic.description && (
            <div className="p-3 rounded-xl bg-slate-100/60 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 text-xs text-slate-600 dark:text-slate-300">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mb-1">
                <Sparkles className="w-3 h-3" /> DIUQBank Question Pattern:
              </span>
              {topic.description}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Study Notes (Tricks, Past Exam Nuances, Formulas):
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Remember that dynamic memory allocation in C requires checking if malloc returns NULL. In DIU midterm, they always ask about pointer subtraction..."
              rows={6}
              className="w-full text-xs font-mono p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition resize-y"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-glow-emerald hover:brightness-105 disabled:opacity-50 transition"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : 'Save Notes'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
