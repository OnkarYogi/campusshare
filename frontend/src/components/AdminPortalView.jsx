import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';

const AdminPortalView = () => {
  const [metrics, setMetrics] = useState(null);
  const [users, setUsers] = useState([]);
  const [resources, setResources] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [activeAdminTab, setActiveAdminTab] = useState('users'); // 'users', 'resources', 'logs'
  const [searchUser, setSearchUser] = useState('');
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [mRes, uRes, rRes, aRes] = await Promise.all([
        adminService.getMetrics(),
        adminService.getUsers(),
        adminService.getAllResources(),
        adminService.getAuditLogs(),
      ]);

      if (mRes.success) setMetrics(mRes.metrics);
      if (uRes.success) setUsers(uRes.users);
      if (rRes.success) setResources(rRes.resources);
      if (aRes.success) setAuditLogs(aRes.logs);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVerify = async (userId, currentVerified) => {
    try {
      await adminService.verifyUser(userId, !currentVerified);
      setMsg(`Verification status updated.`);
      await loadAdminData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggleSuspend = async (userId, currentSuspended) => {
    try {
      const reason = !currentSuspended ? prompt('Reason for account suspension:') : '';
      if (!currentSuspended && !reason) return;
      await adminService.suspendUser(userId, !currentSuspended, reason);
      setMsg(`Account suspension status updated.`);
      await loadAdminData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggleModerate = async (resourceId, currentModerated) => {
    try {
      await adminService.moderateResource(resourceId, !currentModerated, 'Admin policy review');
      setMsg(`Listing moderation updated.`);
      await loadAdminData();
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.email.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.department.toLowerCase().includes(searchUser.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-100 text-primary text-xs font-bold uppercase tracking-wider mb-1">
            <span className="material-symbols-outlined text-[15px]">admin_panel_settings</span>
            Institutional Governance & Oversight
          </div>
          <h1 className="font-headline text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Administrator Portal
          </h1>
        </div>

        <button
          onClick={loadAdminData}
          className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1 self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-[16px]">refresh</span>
          Refresh Telemetry
        </button>
      </div>

      {msg && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center justify-between">
          <span>{msg}</span>
          <button onClick={() => setMsg('')} className="font-bold text-emerald-600">
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Metric Cards */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Members
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900">
                {metrics.users.total}
              </span>
              <span className="text-xs text-emerald-600 font-medium">
                ({metrics.users.verified} Verified)
              </span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active Listings
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-primary">
                {metrics.catalog.totalListings}
              </span>
              <span className="text-xs text-slate-500">
                ({metrics.catalog.availableListings} Available)
              </span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active Loans
            </span>
            <span className="text-2xl font-extrabold text-amber-600 block">
              {metrics.transactions.activeBorrowings}
            </span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Completed Exchanges
            </span>
            <span className="text-2xl font-extrabold text-emerald-700 block">
              {metrics.transactions.completedLoans}
            </span>
          </div>
        </div>
      )}

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveAdminTab('users')}
          className={`pb-3 px-3 text-xs font-bold transition-all ${
            activeAdminTab === 'users'
              ? 'text-primary border-b-2 border-primary'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          User Verification & Accounts ({users.length})
        </button>

        <button
          onClick={() => setActiveAdminTab('resources')}
          className={`pb-3 px-3 text-xs font-bold transition-all ${
            activeAdminTab === 'resources'
              ? 'text-primary border-b-2 border-primary'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Catalog Moderation ({resources.length})
        </button>

        <button
          onClick={() => setActiveAdminTab('logs')}
          className={`pb-3 px-3 text-xs font-bold transition-all ${
            activeAdminTab === 'logs'
              ? 'text-primary border-b-2 border-primary'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Audit & Compliance Trail ({auditLogs.length})
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-sm text-slate-400">Loading admin view...</div>
      ) : (
        <div>
          {/* TAB 1: USERS */}
          {activeAdminTab === 'users' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <input
                  type="text"
                  placeholder="Search user name, email, or department..."
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  className="w-full max-w-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-secondary"
                />
              </div>

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                    <tr>
                      <th className="py-3 px-4">Member</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Trust Score</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-900">{u.name}</p>
                          <p className="text-[11px] text-slate-500 font-mono">{u.email}</p>
                        </td>
                        <td className="py-3 px-4 capitalize font-medium">{u.role.replace('_', ' ')}</td>
                        <td className="py-3 px-4">{u.department}</td>
                        <td className="py-3 px-4 font-semibold text-emerald-700">
                          ⭐ {u.trustScore} ({u.totalCompletedLoans} loans)
                        </td>
                        <td className="py-3 px-4">
                          {u.isSuspended ? (
                            <span className="px-2 py-0.5 rounded-full bg-red-100 text-error font-bold text-[10px]">
                              Suspended
                            </span>
                          ) : u.isVerified ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                              Verified
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                              Unverified
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            onClick={() => handleToggleVerify(u.id, u.isVerified)}
                            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                              u.isVerified
                                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            }`}
                          >
                            {u.isVerified ? 'Revoke Verify' : 'Verify'}
                          </button>
                          <button
                            onClick={() => handleToggleSuspend(u.id, u.isSuspended)}
                            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                              u.isSuspended
                                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                : 'bg-red-50 hover:bg-red-100 text-error border border-red-200'
                            }`}
                          >
                            {u.isSuspended ? 'Lift Suspension' : 'Suspend'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: RESOURCES */}
          {activeAdminTab === 'resources' && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">Resource</th>
                    <th className="py-3 px-4">Steward</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Moderation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {resources.map((r) => (
                    <tr key={r._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900">{r.title}</p>
                        <p className="text-[11px] text-slate-500">{r.location}</p>
                      </td>
                      <td className="py-3 px-4">{r.steward?.name}</td>
                      <td className="py-3 px-4">{r.department}</td>
                      <td className="py-3 px-4 capitalize font-semibold">{r.status}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleToggleModerate(r._id, r.isModerated)}
                          className={`px-3 py-1 rounded text-[11px] font-bold transition-colors ${
                            r.isModerated
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-error'
                          }`}
                        >
                          {r.isModerated ? 'Hidden (Flagged)' : 'Hide / Moderate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: AUDIT LOGS */}
          {activeAdminTab === 'logs' && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="divide-y divide-slate-100">
                {auditLogs.map((log) => (
                  <div key={log._id} className="p-3.5 text-xs flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-slate-400 text-[18px]">
                        history
                      </span>
                      <div>
                        <span className="font-bold font-mono text-primary text-[11px] mr-2">
                          [{log.action}]
                        </span>
                        <span className="text-slate-800 font-medium">
                          {log.user?.name ? `${log.user.name} (${log.user.email})` : 'System Operation'}
                        </span>
                        {log.details && (
                          <span className="text-slate-500 ml-2">
                            {JSON.stringify(log.details)}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono flex-shrink-0">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPortalView;
