import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getQuestionByIdApi, answerQuestionApi, voteContentApi, acceptAnswerApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ThumbsUp, CheckCircle2, Send, ArrowLeft, MessageSquare } from 'lucide-react';

export default function QaDetailPage() {
  const { questionId } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newAnswer, setNewAnswer] = useState('');

  useEffect(() => {
    fetchQuestionDetails();
  }, [questionId]);

  const fetchQuestionDetails = async () => {
    try {
      const res = await getQuestionByIdApi(questionId);
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load question details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostAnswer = async (e) => {
    e.preventDefault();
    if (!newAnswer.trim()) return;
    try {
      const res = await answerQuestionApi(questionId, { content: newAnswer });
      if (res.data.success) {
        setNewAnswer('');
        fetchQuestionDetails();
      }
    } catch (err) {
      console.error('Failed to post answer:', err);
    }
  };

  const handleAcceptAnswer = async (answerId) => {
    try {
      const res = await acceptAnswerApi(answerId);
      if (res.data.success) {
        fetchQuestionDetails();
      }
    } catch (err) {
      console.error('Failed to accept answer:', err);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#500071]"></div>
      </div>
    );
  }

  const question = data?.question || {};
  const answers = data?.answers || [];

  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      {/* Back button */}
      <Link to="/qa" className="inline-flex items-center gap-2 text-xs font-bold text-[#500071] hover:text-[#8A2A78]">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Discussions</span>
      </Link>

      {/* Main Question Card */}
      <div className="bg-white rounded-3xl p-8 border border-purple-100 shadow-sm space-y-4">
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#500071]/10 text-[#500071] border border-[#500071]/20">
          {question.category}
        </span>
        <h1 className="text-2xl font-black text-[#290044]">{question.title}</h1>
        <div className="flex items-center gap-3 text-xs text-slate-500 border-b border-purple-50 pb-4">
          <span className="font-bold text-[#500071]">Asked by {question.author?.name}</span>
          <span>•</span>
          <span>{question.views} views</span>
          <span>•</span>
          <span className="font-semibold text-[#8A2A78]">{answers.length} answers</span>
        </div>
        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{question.description}</p>
      </div>

      {/* Answers Section */}
      <div className="space-y-6">
        <h2 className="font-bold text-[#290044] text-lg">{answers.length} Answers</h2>

        <div className="space-y-4">
          {answers.map((ans) => (
            <div
              key={ans._id}
              className={`rounded-3xl p-6 border transition-all ${
                ans.isAccepted ? 'bg-[#EEE3B0]/30 border-[#cbaf6a]' : 'bg-white border-purple-100'
              }`}
            >
              {ans.isAccepted && (
                <div className="mb-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#500071] text-[#EEE3B0] shadow-sm">
                  <CheckCircle2 className="w-4 h-4 text-[#EEE3B0]" /> ACCEPTED ANSWER BY AUTHOR
                </div>
              )}

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#500071] to-[#8A2A78] text-[#EEE3B0] font-bold flex items-center justify-center shrink-0 border border-[#EEE3B0]/30">
                  {ans.author?.name ? ans.author.name.charAt(0).toUpperCase() : 'A'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-[#290044] text-sm">{ans.author?.name}</h4>
                      <p className="text-[11px] text-[#8A2A78] font-semibold capitalize">{ans.author?.role}</p>
                    </div>

                    {question.author?._id === user?.id && !ans.isAccepted && (
                      <button
                        onClick={() => handleAcceptAnswer(ans._id)}
                        className="px-3 py-1 rounded-lg bg-[#EEE3B0] text-[#290044] hover:bg-[#500071] hover:text-[#EEE3B0] font-bold text-xs transition-colors border border-[#cbaf6a]/50"
                      >
                        Accept Answer
                      </button>
                    )}
                  </div>

                  <p className="text-sm text-slate-800 mt-3 leading-relaxed whitespace-pre-line">{ans.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Post Answer Form */}
        <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-sm">
          <h3 className="font-bold text-[#290044] text-base mb-3">Your Answer</h3>
          <form onSubmit={handlePostAnswer} className="space-y-3">
            <textarea
              rows="5"
              required
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              placeholder="Write a clear, helpful answer for your peers..."
              className="w-full px-4 py-3 rounded-2xl border border-purple-200 text-sm outline-none focus:ring-2 focus:ring-[#500071]/20 focus:border-[#8A2A78]"
            ></textarea>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#500071] to-[#8A2A78] text-[#EEE3B0] font-bold text-xs shadow-md shadow-[#500071]/25 transition-all flex items-center gap-2 hover:opacity-95 border border-[#EEE3B0]/30"
            >
              <Send className="w-4 h-4 text-[#EEE3B0]" />
              <span>Submit Answer</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
