import React, { useState, useEffect } from 'react';
import { borrowService, resourceService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import RatingModal from './RatingModal';

const MyLoansView = ({ onSelectResource, onOpenAddResource }) => {
  const { user } = useAuth();

  // Primary section tab: 'ongoing' | 'completed' | 'closed' | 'my_listings'
  const [activeTab, setActiveTab] = useState('ongoing');

  // Role filter within transactions: 'all' | 'incoming' | 'outgoing'
  const [roleFilter, setRoleFilter] = useState('all');

  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [ratingTransaction, setRatingTransaction] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [resourceToWithdraw, setResourceToWithdraw] = useState(null);
  const [withdrawModalError, setWithdrawModalError] = useState('');

  const handleConfirmWithdraw = async () => {
    if (!resourceToWithdraw) return;
    try {
      setActionLoading(resourceToWithdraw._id);
      setWithdrawModalError('');
      await resourceService.withdrawResource(resourceToWithdraw._id);
      setFeedbackMsg(`"${resourceToWithdraw.title}" has been safely withdrawn from the campus catalog.`);
      setResourceToWithdraw(null);
      await loadAllData();
    } catch (err) {
      setWithdrawModalError(err.message || 'Failed to withdraw resource.');
    } finally {
      setActionLoading(null);
    }
  };

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

  // Status classification helpers
  const isOngoing = (status) => ['pending', 'approved', 'borrowed', 'return_requested'].includes(status);
  const isCompleted = (status) => status === 'returned';
  const isClosed = (status) => ['cancelled', 'rejected'].includes(status);

  // Grouped datasets
  const allTransactions = [
    ...incomingRequests.map((r) => ({ ...r, rolePerspective: 'incoming' })),
    ...outgoingRequests.map((r) => ({ ...r, rolePerspective: 'outgoing' })),
  ];

  const ongoingList = allTransactions.filter((r) => isOngoing(r.status));
  const completedList = allTransactions.filter((r) => isCompleted(r.status));
  const closedList = allTransactions.filter((r) => isClosed(r.status));

  // Filter by role perspective
  const filterByRole = (list) => {
    if (roleFilter === 'incoming') return list.filter((r) => r.rolePerspective === 'incoming');
    if (roleFilter === 'outgoing') return list.filter((r) => r.rolePerspective === 'outgoing');
    return list;
  };

  const currentOngoing = filterByRole(ongoingList);
  const currentCompleted = filterByRole(completedList);
  const currentClosed = filterByRole(closedList);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span data-testid="loan-status-badge" className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            Pending Approval
          </span>
        );
      case 'approved':
        return (
          <span data-testid="loan-status-badge" className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 text-xs font-semibold inline-flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">check</span>
            Approved (Ready for Pickup)
          </span>
        );
      case 'borrowed':
        return (
          <span data-testid="loan-status-badge" className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200 text-xs font-semibold inline-flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">timer</span>
            In Custody / Checked Out
          </span>
        );
      case 'return_requested':
        return (
          <span data-testid="loan-status-badge" className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200 text-xs font-semibold inline-flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">published_with_changes</span>
            Return Awaiting Confirmation
          </span>
        );
      case 'returned':
        return (
          <span data-testid="loan-status-badge" className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold inline-flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">verified</span>
            Returned & Completed
          </span>
        );
      case 'cancelled':
        return (
          <span data-testid="loan-status-badge" className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-xs font-semibold inline-flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">cancel</span>
            Cancelled
          </span>
        );
      case 'rejected':
        return (
          <span data-testid="loan-status-badge" className="px-2.5 py-0.5 rounded-full bg-red-50 text-error border border-red-200 text-xs font-semibold inline-flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">close</span>
            Declined
          </span>
        );
      default:
        return null;
    }
  };

  // Render an individual transaction card
  const renderTransactionCard = (req) => {
    const isOwner = req.rolePerspective === 'incoming' || req.steward?._id === user?._id;

    return (
      <div
        key={`${req.rolePerspective}-${req._id}`}
        data-testid="loan-card"
        className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4 hover:border-slate-300 transition-colors"
      >
        {/* Top bar: Resource title, participant tag, and status badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <img
              src={req.resource?.images?.[0] || '/resource-placeholder.svg'}
              alt=""
              className="w-12 h-12 rounded-lg object-cover border border-slate-200 flex-shrink-0"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/resource-placeholder.svg';
              }}
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-headline font-bold text-sm text-slate-900 line-clamp-1">
                  {req.resource?.title}
                </h3>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  isOwner ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-teal-50 text-teal-700 border border-teal-100'
                }`}>
                  {isOwner ? 'You are Steward' : 'You are Borrower'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Pickup Location: <span className="font-medium text-slate-700">{req.resource?.location || 'Campus Hub'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {getStatusBadge(req.status)}
          </div>
        </div>

        {/* 3-column details grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <span className="text-slate-400 block mb-0.5 font-medium">
              {isOwner ? 'Borrower' : 'Resource Steward'}
            </span>
            <span className="font-bold text-slate-800">
              {isOwner ? req.borrower?.name : req.steward?.name}
            </span>
            <span className="text-slate-500 block truncate">
              {isOwner
                ? `${req.borrower?.department || 'Student'} • ⭐ ${req.borrower?.trustScore || '5.0'}`
                : `${req.steward?.department || 'Steward'} • ⭐ ${req.steward?.trustScore || '5.0'}`}
            </span>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <span className="text-slate-400 block mb-0.5 font-medium">Loan Timeline</span>
            <span className="font-bold text-slate-800">
              {new Date(req.startDate).toLocaleDateString()} → {new Date(req.endDate).toLocaleDateString()}
            </span>
            <span className="text-slate-500 block">
              Duration: {req.durationDays} Days
              {req.returnedAt && ` • Completed: ${new Date(req.returnedAt).toLocaleDateString()}`}
            </span>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <span className="text-slate-400 block mb-0.5 font-medium">Academic Purpose</span>
            <p className="text-slate-700 italic line-clamp-2">"{req.purpose}"</p>
          </div>
        </div>

        {/* Additional metadata notes if available */}
        {(req.handoverNotes || req.returnNotes || req.rejectionReason) && (
          <div className="text-xs bg-slate-50/70 p-2.5 rounded-lg border border-slate-100 space-y-1">
            {req.handoverNotes && (
              <p className="text-slate-600">
                <strong className="text-slate-700">Handover Notes:</strong> {req.handoverNotes}
              </p>
            )}
            {req.returnNotes && (
              <p className="text-slate-600">
                <strong className="text-slate-700">Return Notes:</strong> {req.returnNotes}
              </p>
            )}
            {req.rejectionReason && (
              <p className="text-red-700">
                <strong>Decline Reason:</strong> {req.rejectionReason}
              </p>
            )}
          </div>
        )}

        {/* Action Controls & Available Next Steps */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="text-slate-400 text-[11px]">
            {isOngoing(req.status) ? (
              <span className="flex items-center gap-1 text-amber-700 font-medium">
                <span className="material-symbols-outlined text-[14px]">pending_actions</span>
                Action Required to Advance Workflow
              </span>
            ) : isCompleted(req.status) ? (
              <span className="flex items-center gap-1 text-emerald-700 font-medium">
                <span className="material-symbols-outlined text-[14px]">task_alt</span>
                Transaction Finished & Recorded
              </span>
            ) : (
              <span className="flex items-center gap-1 text-slate-500 font-medium">
                <span className="material-symbols-outlined text-[14px]">archive</span>
                Closed Transaction
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* STEWARD ACTIONS */}
            {isOwner && (
              <>
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
                      className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
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
                      className="px-3.5 py-1.5 rounded-lg bg-primary hover:bg-slate-900 text-white text-xs font-bold transition-colors shadow-sm"
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
                    className="px-3.5 py-1.5 rounded-lg bg-secondary hover:bg-teal-700 text-white text-xs font-bold transition-colors shadow-sm flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">how_to_reg</span>
                    Confirm Borrower Picked Up
                  </button>
                )}

                {(req.status === 'borrowed' || req.status === 'return_requested') && (
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
                    data-testid="rate-borrower-btn"
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
              </>
            )}

            {/* BORROWER ACTIONS */}
            {!isOwner && (
              <>
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
                  <div className="text-xs text-primary font-semibold flex items-center gap-1.5 bg-blue-50/60 px-3 py-1.5 rounded-lg border border-blue-100">
                    <span className="material-symbols-outlined text-[18px]">verified</span>
                    Approved! Coordinate pick-up with {req.steward?.name} at {req.resource?.location}.
                  </div>
                )}

                {req.status === 'borrowed' && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-purple-800 font-medium hidden sm:inline">
                      Due: {new Date(req.endDate).toLocaleDateString()}
                    </span>
                    <button
                      data-testid="initiate-return-btn"
                      disabled={actionLoading === req._id}
                      onClick={() =>
                        handleAction(
                          (id) => borrowService.requestReturn(id),
                          req._id,
                          'Return initiated! The resource owner has been notified to verify and confirm.'
                        )
                      }
                      className="px-3.5 py-1.5 rounded-lg bg-primary hover:bg-slate-900 text-white text-xs font-bold transition-colors shadow-sm flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[16px]">keyboard_return</span>
                      Initiate Return
                    </button>
                  </div>
                )}

                {req.status === 'return_requested' && (
                  <div className="text-xs text-indigo-700 font-semibold flex items-center gap-1.5 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100">
                    <span className="material-symbols-outlined text-[18px]">pending</span>
                    Return initiated! Awaiting steward confirmation.
                  </div>
                )}

                {req.status === 'returned' && !req.borrowerRated && (
                  <button
                    data-testid="rate-steward-btn"
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
              </>
            )}
          </div>
        </div>
      </div>
    );
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
            Track ongoing academic handoffs, inspect completed loans, and manage your campus listings.
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
          <button onClick={() => setFeedbackMsg('')} className="text-emerald-600 font-bold hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Primary Section Tabs: Clearly separating Ongoing from Completed */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-1">
        <div className="flex items-center gap-2 overflow-x-auto">
          {/* TAB 1: ONGOING TRANSACTIONS */}
          <button
            data-testid="tab-ongoing"
            onClick={() => setActiveTab('ongoing')}
            className={`pb-3 px-3 text-xs font-bold transition-all relative flex items-center gap-1.5 ${
              activeTab === 'ongoing'
                ? 'text-primary border-b-2 border-primary'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">sync</span>
            Ongoing Transactions
            <span className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              ongoingList.length > 0 ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-600'
            }`}>
              {ongoingList.length}
            </span>
          </button>

          {/* TAB 2: COMPLETED TRANSACTIONS */}
          <button
            data-testid="tab-completed"
            onClick={() => setActiveTab('completed')}
            className={`pb-3 px-3 text-xs font-bold transition-all relative flex items-center gap-1.5 ${
              activeTab === 'completed'
                ? 'text-primary border-b-2 border-primary'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">task_alt</span>
            Completed Transactions
            <span className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              completedList.length > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
            }`}>
              {completedList.length}
            </span>
          </button>

          {/* TAB 3: CLOSED / CANCELLED */}
          <button
            data-testid="tab-closed"
            onClick={() => setActiveTab('closed')}
            className={`pb-3 px-3 text-xs font-bold transition-all relative flex items-center gap-1.5 ${
              activeTab === 'closed'
                ? 'text-primary border-b-2 border-primary'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">archive</span>
            Cancelled & Declined
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
              {closedList.length}
            </span>
          </button>

          {/* TAB 4: MY LISTINGS */}
          <button
            data-testid="tab-my-listings"
            onClick={() => setActiveTab('my_listings')}
            className={`pb-3 px-3 text-xs font-bold transition-all relative flex items-center gap-1.5 ${
              activeTab === 'my_listings'
                ? 'text-primary border-b-2 border-primary'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">inventory_2</span>
            My Listed Resources
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
              {myListings.length}
            </span>
          </button>
        </div>

        {/* Secondary Role Filter (Only applicable inside transaction tabs) */}
        {activeTab !== 'my_listings' && (
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-[11px] font-semibold text-slate-600 self-end sm:self-auto">
            <button
              onClick={() => setRoleFilter('all')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                roleFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              All Roles
            </button>
            <button
              data-testid="tab-incoming"
              onClick={() => setRoleFilter('incoming')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                roleFilter === 'incoming' ? 'bg-white text-primary shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              <span>Incoming (As Steward)</span>
            </button>
            <button
              data-testid="tab-outgoing"
              onClick={() => setRoleFilter('outgoing')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                roleFilter === 'outgoing' ? 'bg-white text-primary shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              <span>Outgoing (As Borrower)</span>
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="py-20 text-center text-sm text-slate-400">Loading your transactions...</div>
      ) : (
        <div className="space-y-4">
          {/* SECTION 1: ONGOING TRANSACTIONS */}
          {activeTab === 'ongoing' && (
            <div>
              <div className="mb-3 flex items-center justify-between text-xs text-slate-500">
                <p>
                  Active transactions requiring action or currently in custody. Status moves to Completed once return is confirmed by owner.
                </p>
                <span className="font-semibold text-slate-700">Showing {currentOngoing.length} active loan{currentOngoing.length === 1 ? '' : 's'}</span>
              </div>

              {currentOngoing.length === 0 ? (
                <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8 space-y-2">
                  <span className="material-symbols-outlined text-[36px] text-slate-300">
                    check_circle_outline
                  </span>
                  <p className="text-sm font-bold text-slate-700">No ongoing transactions</p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    You have no pending requests or resources currently in custody. Explore the campus catalog to borrow or list items to share.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {currentOngoing.map(renderTransactionCard)}
                </div>
              )}
            </div>
          )}

          {/* SECTION 2: COMPLETED TRANSACTIONS */}
          {activeTab === 'completed' && (
            <div>
              <div className="mb-3 flex items-center justify-between text-xs text-slate-500">
                <p>
                  Transactions where the resource has been confirmed returned by the owner. These represent verified completed exchanges.
                </p>
                <span className="font-semibold text-emerald-800">Showing {currentCompleted.length} completed loan{currentCompleted.length === 1 ? '' : 's'}</span>
              </div>

              {currentCompleted.length === 0 ? (
                <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8 space-y-2">
                  <span className="material-symbols-outlined text-[36px] text-slate-300">
                    history_edu
                  </span>
                  <p className="text-sm font-bold text-slate-700">No completed transactions yet</p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    When active loans are returned and confirmed by the resource owner, their permanent history and ratings will appear here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {currentCompleted.map(renderTransactionCard)}
                </div>
              )}
            </div>
          )}

          {/* SECTION 3: CLOSED / CANCELLED REQUESTS */}
          {activeTab === 'closed' && (
            <div>
              <div className="mb-3 flex items-center justify-between text-xs text-slate-500">
                <p>
                  Archived borrow requests that were cancelled by the borrower or declined by the steward. Kept separate from completed transactions.
                </p>
                <span className="font-semibold text-slate-700">Showing {currentClosed.length} archived record{currentClosed.length === 1 ? '' : 's'}</span>
              </div>

              {currentClosed.length === 0 ? (
                <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8 space-y-2">
                  <span className="material-symbols-outlined text-[36px] text-slate-300">
                    folder_open
                  </span>
                  <p className="text-sm font-bold text-slate-700">No cancelled or declined requests</p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Cancelled requests and declined borrow attempts are cleanly archived here without affecting your completed transactions.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {currentClosed.map(renderTransactionCard)}
                </div>
              )}
            </div>
          )}

          {/* SECTION 4: MY LISTED RESOURCES */}
          {activeTab === 'my_listings' && (
            <div>
              {myListings.length === 0 ? (
                <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8 space-y-2">
                  <span className="material-symbols-outlined text-[36px] text-slate-300">
                    inventory_2
                  </span>
                  <p className="text-sm font-bold text-slate-700">No resources listed yet</p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mb-3">
                    Have extra lab sensors, textbooks, or tools? Share them with the campus community.
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
                          src={res.images?.[0] || '/resource-placeholder.svg'}
                          alt=""
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = '/resource-placeholder.svg';
                          }}
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
                          <button
                            type="button"
                            onClick={() => {
                              setWithdrawModalError('');
                              setResourceToWithdraw(res);
                            }}
                            className="text-error hover:text-red-700 font-semibold flex items-center gap-1 transition-colors"
                            title="Withdraw listing from campus catalog"
                          >
                            <span className="material-symbols-outlined text-[15px]">archive</span>
                            <span>Withdraw</span>
                          </button>
                          <button
                            onClick={() => onSelectResource(res)}
                            className="text-primary hover:underline font-bold flex items-center gap-0.5"
                          >
                            <span>View Details</span>
                            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
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

      {/* Withdraw Listing Confirmation Modal */}
      {resourceToWithdraw && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-100 text-error flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-[26px]">archive</span>
              </div>

              <div className="text-center space-y-1">
                <h3 className="font-headline font-bold text-base text-slate-900">
                  Withdraw Listing from Catalog?
                </h3>
                <p className="text-xs text-slate-600 font-medium">
                  "{resourceToWithdraw.title}"
                </p>
              </div>

              {withdrawModalError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-error font-medium flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] flex-shrink-0">error</span>
                  <span>{withdrawModalError}</span>
                </div>
              )}

              {['borrowed', 'requested'].includes(resourceToWithdraw.status) ? (
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 space-y-1">
                  <p className="font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">warning</span>
                    Active Hold / Loan Restriction
                  </p>
                  <p className="text-[11px] leading-relaxed">
                    This item currently has pending holds or is in borrower custody. In compliance with <strong>SRS Business Rule 5.5</strong>, resources with active requests or ongoing loans cannot be withdrawn until returned.
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-500 text-center leading-relaxed">
                  Withdrawing will deactivate this resource listing, preventing other students or faculty from sending new borrow requests. Completed exchange history and audit trails will remain preserved.
                </p>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  disabled={actionLoading === resourceToWithdraw._id}
                  onClick={() => setResourceToWithdraw(null)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={actionLoading === resourceToWithdraw._id}
                  onClick={handleConfirmWithdraw}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {actionLoading === resourceToWithdraw._id ? (
                    'Withdrawing...'
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[16px]">archive</span>
                      Confirm Withdraw
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyLoansView;
