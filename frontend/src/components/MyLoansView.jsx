import React, { useState, useEffect } from 'react';
import { borrowService, resourceService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import RatingModal from './RatingModal';

const MyLoansView = ({ onSelectResource, onOpenAddResource }) => {
  const { user } = useAuth();
  const [subTab, setSubTab] = useState('incoming'); // 'incoming', 'outgoing', 'my_listings'
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [ratingTransaction, setRatingTransaction] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [incRes, outRes, listRes] = await Promise.all([
        borrowService.getIncomingRequests(),
        borrowService.getMyRequests(),
        resourceService.getMyListings(),
      ]);

      if (incRes.success) setIncomingRequests(incRes.requests);
      if (outRes.success) setOutgoingRequests(outRes.requests);
      if (listRes.success) setMyListings(listRes.resources);
    } catch (err) {
      console.error('Error loading loan data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (actionFn, requestId, successText) => {
    try {
      setActionLoading(requestId);
      setFeedbackMsg('');
      await actionFn(requestId);
      setFeedbackMsg(successText);
      await loadAllData();
    } catch (err) {
      alert(err.message || 'Operation failed');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold">
            Pending Approval
          </span>
        );
      case 'approved':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 text-xs font-semibold">
            Approved (Ready for Pickup)
          </span>
        );
      case 'borrowed':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200 text-xs font-semibold">
            In Custody / Checked Out
          </span>
        );
      case 'returned':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
            Returned & Closed
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-xs font-semibold">
            Cancelled
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-red-50 text-error border border-red-200 text-xs font-semibold">
            Declined
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="font-headline text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Borrowings & Lending Desk
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track academic handoffs, manage incoming loan requests, and review transaction history.
          </p>
        </div>

        <button
          onClick={onOpenAddResource}
          className="px-4 py-2 rounded-lg bg-primary hover:bg-slate-900 text-white text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          List Another Resource
        </button>
      </div>

      {feedbackMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center justify-between">
          <span>{feedbackMsg}</span>
          <button onClick={() => setFeedbackMsg('')} className="text-emerald-600 font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setSubTab('incoming')}
          className={`pb-3 px-3 text-xs font-bold transition-all relative ${
            subTab === 'incoming'
              ? 'text-primary border-b-2 border-primary'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Incoming Requests for My Items
          {incomingRequests.filter((r) => r.status === 'pending').length > 0 && (
            <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-secondary text-white text-[10px] font-bold">
              {incomingRequests.filter((r) => r.status === 'pending').length}
            </span>
          )}
        </button>

        <button
          onClick={() => setSubTab('outgoing')}
          className={`pb-3 px-3 text-xs font-bold transition-all relative ${
            subTab === 'outgoing'
              ? 'text-primary border-b-2 border-primary'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          My Borrow Requests
          <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold">
            {outgoingRequests.length}
          </span>
        </button>

        <button
          onClick={() => setSubTab('my_listings')}
          className={`pb-3 px-3 text-xs font-bold transition-all relative ${
            subTab === 'my_listings'
              ? 'text-primary border-b-2 border-primary'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          My Listed Resources
          <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold">
            {myListings.length}
          </span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-sm text-slate-400">Loading your transactions...</div>
      ) : (
        <div className="space-y-4">
          {/* TAB 1: INCOMING REQUESTS (AS STEWARD) */}
          {subTab === 'incoming' && (
            <div>
              {incomingRequests.length === 0 ? (
                <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8 space-y-2">
                  <span className="material-symbols-outlined text-[36px] text-slate-300">
                    inbox
                  </span>
                  <p className="text-sm font-bold text-slate-700">No incoming requests</p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    When fellow students or faculty request to borrow your listed resources, they
                    will appear here for your review and approval.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {incomingRequests.map((req) => (
                    <div
                      key={req._id}
                      className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              req.resource?.images?.[0] ||
                              'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'
                            }
                            alt=""
                            className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                          />
                          <div>
                            <h3 className="font-headline font-bold text-sm text-slate-900">
                              {req.resource?.title}
                            </h3>
                            <p className="text-xs text-slate-500">
                              Pickup Location: {req.resource?.location}
                            </p>
                          </div>
                        </div>

                        <div>{getStatusBadge(req.status)}</div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                          <span className="text-slate-400 block mb-0.5">Borrower</span>
                          <span className="font-bold text-slate-800">{req.borrower?.name}</span>
                          <span className="text-slate-500 block truncate">
                            {req.borrower?.department} • ⭐ {req.borrower?.trustScore}
                          </span>
                        </div>

                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                          <span className="text-slate-400 block mb-0.5">Requested Duration</span>
                          <span className="font-bold text-slate-800">
                            {new Date(req.startDate).toLocaleDateString()} →{' '}
                            {new Date(req.endDate).toLocaleDateString()}
                          </span>
                          <span className="text-slate-500 block">
                            Duration: {req.durationDays} Days
                          </span>
                        </div>

                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                          <span className="text-slate-400 block mb-0.5">Academic Purpose</span>
                          <p className="text-slate-700 italic line-clamp-2">"{req.purpose}"</p>
                        </div>
                      </div>

                      {/* Steward Action Controls */}
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                        {req.status === 'pending' && (
                          <>
                            <button
                              disabled={actionLoading === req._id}
                              onClick={() =>
                                handleAction(
                                  (id) => borrowService.rejectRequest(id, { rejectionReason: 'Schedule conflict' }),
                                  req._id,
                                  'Request declined.'
                                )
                              }
                              className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                            >
                              Decline
                            </button>
                            <button
                              disabled={actionLoading === req._id}
                              onClick={() =>
                                handleAction(
                                  (id) => borrowService.approveRequest(id),
                                  req._id,
                                  'Request approved! Coordinate pickup with borrower.'
                                )
                              }
                              className="px-4 py-1.5 rounded-lg bg-primary hover:bg-slate-900 text-white text-xs font-bold transition-colors shadow-sm"
                            >
                              Approve Request
                            </button>
                          </>
                        )}

                        {req.status === 'approved' && (
                          <button
                            disabled={actionLoading === req._id}
                            onClick={() =>
                              handleAction(
                                (id) =>
                                  borrowService.collectResource(id, {
                                    handoverNotes: 'Handed over at campus hub.',
                                  }),
                                req._id,
                                'Marked as collected and in custody.'
                              )
                            }
                            className="px-4 py-1.5 rounded-lg bg-secondary hover:bg-teal-700 text-white text-xs font-bold transition-colors shadow-sm flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[16px]">how_to_reg</span>
                            Confirm Borrower Picked Up
                          </button>
                        )}

                        {req.status === 'borrowed' && (
                          <button
                            disabled={actionLoading === req._id}
                            onClick={() =>
                              handleAction(
                                (id) =>
                                  borrowService.confirmReturn(id, {
                                    returnNotes: 'Confirmed returned in good condition.',
                                  }),
                                req._id,
                                'Return confirmed! Resource is now available again for the campus.'
                              )
                            }
                            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-sm flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[16px]">check_circle</span>
                            Confirm Successful Return
                          </button>
                        )}

                        {req.status === 'returned' && !req.stewardRated && (
                          <button
                            onClick={() => setRatingTransaction(req)}
                            className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors shadow-sm flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[16px]">star</span>
                            Rate Borrower
                          </button>
                        )}

                        {req.status === 'returned' && req.stewardRated && (
                          <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">verified</span>
                            Rating Submitted
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: OUTGOING BORROW REQUESTS */}
          {subTab === 'outgoing' && (
            <div>
              {outgoingRequests.length === 0 ? (
                <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8 space-y-2">
                  <span className="material-symbols-outlined text-[36px] text-slate-300">
                    local_shipping
                  </span>
                  <p className="text-sm font-bold text-slate-700">No outgoing borrow requests</p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Explore the catalog and click "Borrow Resource" to request equipment, books, or
                    project kits.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {outgoingRequests.map((req) => (
                    <div
                      key={req._id}
                      className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              req.resource?.images?.[0] ||
                              'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'
                            }
                            alt=""
                            className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                          />
                          <div>
                            <h3 className="font-headline font-bold text-sm text-slate-900">
                              {req.resource?.title}
                            </h3>
                            <p className="text-xs text-slate-500">
                              Steward: {req.steward?.name} • Pickup: {req.resource?.location}
                            </p>
                          </div>
                        </div>

                        <div>{getStatusBadge(req.status)}</div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                          <span className="text-slate-400 block mb-0.5">Loan Dates</span>
                          <span className="font-bold text-slate-800">
                            {new Date(req.startDate).toLocaleDateString()} →{' '}
                            {new Date(req.endDate).toLocaleDateString()}
                          </span>
                          <span className="text-slate-500 block">
                            Duration: {req.durationDays} Days
                          </span>
                        </div>

                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                          <span className="text-slate-400 block mb-0.5">Your Submitted Purpose</span>
                          <p className="text-slate-700 italic">"{req.purpose}"</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                        {req.status === 'pending' && (
                          <button
                            disabled={actionLoading === req._id}
                            onClick={() =>
                              handleAction(
                                (id) => borrowService.cancelRequest(id),
                                req._id,
                                'Your request has been cancelled.'
                              )
                            }
                            className="px-3.5 py-1.5 rounded-lg border border-red-200 text-xs font-semibold text-error hover:bg-red-50 transition-colors"
                          >
                            Cancel Request
                          </button>
                        )}

                        {req.status === 'approved' && (
                          <div className="text-xs text-primary font-semibold flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[18px]">verified</span>
                            Approved! Coordinate pick-up with {req.steward?.name} at{' '}
                            {req.resource?.location}.
                          </div>
                        )}

                        {req.status === 'borrowed' && (
                          <div className="text-xs text-purple-800 font-semibold flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[18px]">timer</span>
                            Currently checked out. Please return on or before{' '}
                            {new Date(req.endDate).toLocaleDateString()}.
                          </div>
                        )}

                        {req.status === 'returned' && !req.borrowerRated && (
                          <button
                            onClick={() => setRatingTransaction(req)}
                            className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors shadow-sm flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[16px]">star</span>
                            Rate Steward & Experience
                          </button>
                        )}

                        {req.status === 'returned' && req.borrowerRated && (
                          <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">verified</span>
                            Review Submitted
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MY LISTED RESOURCES */}
          {subTab === 'my_listings' && (
            <div>
              {myListings.length === 0 ? (
                <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8 space-y-2">
                  <span className="material-symbols-outlined text-[36px] text-slate-300">
                    inventory_2
                  </span>
                  <p className="text-sm font-bold text-slate-700">No resources listed yet</p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mb-3">
                    Have extra lab sensors, textbooks, or tools? Share them with the campus
                    community.
                  </p>
                  <button
                    onClick={onOpenAddResource}
                    className="px-4 py-2 rounded-lg bg-primary text-white text-xs font-bold shadow-sm"
                  >
                    List Your First Item
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myListings.map((res) => (
                    <div
                      key={res._id}
                      className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between"
                    >
                      <div className="aspect-[16/10] bg-slate-100 relative">
                        <img
                          src={
                            res.images?.[0] ||
                            'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'
                          }
                          alt=""
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2.5 left-2.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                              res.status === 'available'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            {res.status}
                          </span>
                        </div>
                      </div>

                      <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                        <div>
                          <p className="text-xs font-semibold text-primary">{res.department}</p>
                          <h4 className="font-headline font-bold text-sm text-slate-900 line-clamp-2">
                            {res.title}
                          </h4>
                          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">
                              location_on
                            </span>
                            {res.location}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                          <span className="text-slate-500 font-medium">
                            Max {res.maxLoanDurationDays} days
                          </span>
                          <button
                            onClick={() => onSelectResource(res)}
                            className="text-primary hover:underline font-bold"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Reciprocal Rating Modal */}
      {ratingTransaction && (
        <RatingModal
          isOpen={!!ratingTransaction}
          transaction={ratingTransaction}
          onClose={() => setRatingTransaction(null)}
          onSuccess={() => {
            loadAllData();
            setFeedbackMsg('Thank you! Your rating has updated the community trust score.');
          }}
        />
      )}
    </div>
  );
};

export default MyLoansView;
