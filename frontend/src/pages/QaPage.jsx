import React, { useState, useEffect } from 'react';
import { getQuestionsApi, createQuestionApi, getAchieversApi, voteContentApi } from '../services/api';
import AchieverCard from '../components/AchieverCard';
import { HelpCircle, ThumbsUp, MessageSquare, Plus, Search, Filter, CheckCircle2, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function QaPage() {
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'achievers'
  const [questions, setQuestions] = useState([]);
  const [achievers, setAchievers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [showAskModal, setShowAskModal] = useState(false);

  // Ask Question Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [qCategory, setQCategory] = useState('Data Structures & Algorithms');
  const [tags, setTags] = useState('dsa, leetcode, prep');

  useEffect(() => {
    fetchData();
  }, [category, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'all') {
        const res = await getQuestionsApi({ category: category || undefined, search: search || undefined });
        if (res.data.success) setQuestions(res.data.questions);
      } else {
        const res = await getAchieversApi();
        if (res.data.success) setAchievers(res.data.achievers);
      }
    } catch (err) {
      console.error('Failed to load Q&A data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    try {
      const res = await createQuestionApi({
        title,
        description,
        category: qCategory,
        tags: tags.split(',').map(t => t.trim()),
      });
      if (res.data.success) {
        setShowAskModal(false);
        setTitle('');
        setDescription('');
        fetchData();
      }
    } catch (err) {
      console.error('Failed to post question:', err);
    }
  };

  const handleVote = async (targetId, currentUpvotes) => {
    try {
      const res = await voteContentApi({ targetId, targetType: 'Question', voteType: 1 });
      if (res.data.success) {
        setQuestions(prev => prev.map(q => q._id === targetId ? { ...q, upvotesCount: res.data.upvotesCount } : q));
      }
    } catch (err) {
      console.error('Failed to vote:', err);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Achievers' Q&A Platform</h1>
          <p className="text-xs text-slate-500 mt-1">Peer learning community to learn from high performers, seniors, and faculty.</p>
        </div>

        <button
          onClick={() => setShowAskModal(true)}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Ask a Question</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('all')}
          className={`pb-3 px-4 text-xs font-bold transition-colors border-b-2 ${
            activeTab === 'all' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          All Discussions ({questions.length})
        </button>
        <button
          onClick={() => setActiveTab('achievers')}
          className={`pb-3 px-4 text-xs font-bold transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === 'achievers' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Award className="w-3.5 h-3.5" /> Verified Achiever Directory
        </button>
      </div>

      {activeTab === 'all' ? (
        <div className="space-y-6">
          {/* Question List */}
          <div className="space-y-4">
            {questions.map((q) => (
              <div key={q._id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => handleVote(q._id, q.upvotesCount)}
                    className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 border border-slate-200 shrink-0"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span className="text-xs font-bold mt-1">{q.upvotesCount}</span>
                  </button>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                        {q.category}
                      </span>
                      {q.acceptedAnswer && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Solved
                        </span>
                      )}
                    </div>

                    <Link to={`/qa/${q._id}`} className="font-bold text-slate-900 text-base mt-2 hover:text-blue-600 block">
                      {q.title}
                    </Link>

                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">{q.description}</p>

                    <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-700">{q.author?.name}</span>
                        <span>•</span>
                        <span>{q.views} views</span>
                      </div>
                      <Link to={`/qa/${q._id}`} className="font-semibold text-blue-600 flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{q.answersCount} Answers</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Verified Achievers Directory */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {achievers.map((ach) => (
            <AchieverCard key={ach._id} achiever={ach} />
          ))}
        </div>
      )}

      {/* Ask Question Modal */}
      {showAskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 shadow-2xl max-w-lg w-full border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Ask the Community & Achievers</h3>
            <form onSubmit={handleAskQuestion} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Question Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. How to prepare for Data Structures & Algorithms?"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={qCategory}
                  onChange={(e) => setQCategory(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm outline-none"
                >
                  <option value="Data Structures & Algorithms">Data Structures & Algorithms</option>
                  <option value="Full Stack Web Dev">Full Stack Web Dev</option>
                  <option value="Placements & Internships">Placements & Internships</option>
                  <option value="Academics & Exam Prep">Academics & Exam Prep</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Detailed Description</label>
                <textarea
                  rows="4"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide details about your question..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm outline-none"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAskModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs shadow-md shadow-blue-500/20"
                >
                  Post Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
