import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { API_URL } from '../config/api';

const AdminDashboard = () => {
  const { user, token, logout } = useContext(AuthContext);
  const [feedbacks, setFeedbacks] = useState([]);
  const [replyDrafts, setReplyDrafts] = useState({});
  const [submittingId, setSubmittingId] = useState('');
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchFeedbacks = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/support/admin/feedback`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const records = response.data.feedbacks || [];
      setFeedbacks(records);
      setReplyDrafts((prev) => {
        const next = { ...prev };
        records.forEach((feedback) => {
          if (typeof next[feedback._id] !== 'string') {
            next[feedback._id] = feedback.adminReply || '';
          }
        });
        return next;
      });
    } catch (error) {
      setStatus(error.response?.data?.message || 'Unable to load support messages.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, [token]);

  const handleReplyChange = (feedbackId, value) => {
    setReplyDrafts((prev) => ({
      ...prev,
      [feedbackId]: value,
    }));
  };

  const handleReplySubmit = async (feedbackId) => {
    const adminReply = replyDrafts[feedbackId]?.trim();
    if (!adminReply) {
      setStatus('Reply message is required.');
      return;
    }

    setSubmittingId(feedbackId);
    setStatus('');
    try {
      const response = await axios.put(
        `${API_URL}/support/admin/feedback/${feedbackId}/reply`,
        { adminReply, status: 'resolved' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedFeedback = response.data.feedback;

      setFeedbacks((prev) =>
        prev.map((feedback) =>
          feedback._id === feedbackId
            ? {
                ...feedback,
                ...updatedFeedback,
                user: feedback.user,
                repliedBy: updatedFeedback.repliedBy || feedback.repliedBy,
              }
            : feedback
        )
      );
      setReplyDrafts((prev) => ({
        ...prev,
        [feedbackId]: updatedFeedback.adminReply || adminReply,
      }));
      setStatus(response.data.message || 'Reply sent to the user successfully.');
    } catch (error) {
      setStatus(error.response?.data?.message || 'Unable to send admin reply.');
    } finally {
      setSubmittingId('');
    }
  };

  const visibleFeedbacks = feedbacks.filter((feedback) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;

    const subject = feedback.subject?.toLowerCase() || '';
    const message = feedback.message?.toLowerCase() || '';
    const adminReply = feedback.adminReply?.toLowerCase() || '';
    const fullName = feedback.user?.fullName?.toLowerCase() || '';
    const email = feedback.user?.email?.toLowerCase() || '';

    return [subject, message, adminReply, fullName, email].some((value) => value.includes(query));
  });

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(191,212,255,0.45),_transparent_35%),linear-gradient(180deg,#f8fbff_0%,#f8fafc_50%,#eef2ff_100%)] py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="rounded-[28px] border border-white/80 bg-white/90 p-5 shadow-sm backdrop-blur sm:rounded-[32px] sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-700">Admin Panel</p>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Support Replies</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                Welcome back, {user?.fullName || 'Administrator'}. Reply to user support messages here,
                and users will receive the admin response as a popup in their help page.
              </p>
            </div>
            <button type="button" className="btn-secondary w-full sm:w-auto" onClick={logout}>
              Logout
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-[24px] bg-white/90 p-5 shadow-sm sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Total Messages</p>
            <p className="mt-3 text-2xl font-black text-slate-950 sm:text-3xl">{feedbacks.length}</p>
          </div>
          <div className="rounded-[24px] bg-white/90 p-5 shadow-sm sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Pending Replies</p>
            <p className="mt-3 text-2xl font-black text-slate-950 sm:text-3xl">
              {feedbacks.filter((feedback) => !feedback.adminReply).length}
            </p>
          </div>
          <div className="rounded-[24px] bg-white/90 p-5 shadow-sm sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Unseen By Users</p>
            <p className="mt-3 text-2xl font-black text-slate-950 sm:text-3xl">
              {feedbacks.filter((feedback) => feedback.adminReply && feedback.userReplySeen === false).length}
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-[24px] border border-white/80 bg-white/90 p-4 shadow-sm sm:p-5">
          <label htmlFor="admin-feedback-search" className="form-label">
            Search Staff Or User
          </label>
          <input
            id="admin-feedback-search"
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="form-input"
            placeholder="Search by name, email, subject, or message"
          />
        </div>

        {status && (
          <div className="mt-6 rounded-2xl border border-primary-100 bg-primary-50 px-4 py-3 text-sm text-primary-800">
            {status}
          </div>
        )}

        <div className="mt-6 space-y-5">
          {loading ? (
            <div className="rounded-[24px] bg-white/90 p-6 text-slate-600 shadow-sm sm:p-8">Loading support messages...</div>
          ) : visibleFeedbacks.length === 0 ? (
            <div className="rounded-[24px] bg-white/90 p-6 text-slate-600 shadow-sm sm:p-8">No support messages yet.</div>
          ) : (
            visibleFeedbacks.map((feedback) => (
              <div key={feedback._id} className="rounded-[24px] border border-white/80 bg-white/90 p-4 shadow-sm backdrop-blur sm:rounded-[28px] sm:p-6">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <h2 className="break-words text-xl font-bold text-slate-950 sm:text-2xl">{feedback.subject}</h2>
                    <p className="mt-2 text-sm text-slate-500">
                      <span className="break-words">
                        From {feedback.user?.fullName || 'Unknown user'} ({feedback.user?.email || 'No email'})
                      </span>
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 lg:justify-end">
                    <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary-700">
                      {feedback.status}
                    </span>
                    {feedback.adminReply && (
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${
                        feedback.userReplySeen === false
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {feedback.userReplySeen === false ? 'Reply sent successfully' : 'Seen by user'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-5 rounded-[20px] bg-slate-50 p-4 sm:rounded-[24px] sm:p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">User Message</p>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">{feedback.message}</p>
                </div>

                {feedback.adminReply && (
                  <div className="mt-4 rounded-[20px] bg-emerald-50 p-4 sm:rounded-[24px] sm:p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">Latest Admin Reply</p>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">{feedback.adminReply}</p>
                  </div>
                )}

                <div className="mt-5">
                  <label htmlFor={`reply-${feedback._id}`} className="form-label">
                    Admin Reply
                  </label>
                  <textarea
                    id={`reply-${feedback._id}`}
                    rows="4"
                    value={replyDrafts[feedback._id] || ''}
                    onChange={(event) => handleReplyChange(feedback._id, event.target.value)}
                    className="form-input min-h-[140px] resize-y"
                    placeholder="Write the reply the user should receive in the popup."
                  />
                  <div className="mt-4 flex justify-stretch sm:justify-end">
                    <button
                      type="button"
                      className="btn-primary w-full sm:w-auto"
                      disabled={submittingId === feedback._id}
                      onClick={() => handleReplySubmit(feedback._id)}
                    >
                      {submittingId === feedback._id ? 'Sending reply...' : 'Send Reply'}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
