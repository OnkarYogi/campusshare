import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import CampusShareLogo from './CampusShareLogo';

const AuthModal = ({ isOpen, onClose }) => {
  const { login, register, quickLogin } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('student');
  const [department, setDepartment] = useState('Computer Science');
  const [campusId, setCampusId] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await register({
          name,
          email,
          password,
          role,
          department,
          campusId,
        });
      } else {
        await login(email, password);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuick = async (roleKey) => {
    try {
      setLoading(true);
      await quickLogin(roleKey);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-6 text-center border-b border-slate-100 bg-surface-container-low">
          <div className="flex justify-center mb-2">
            <CampusShareLogo />
          </div>
          <p className="text-xs text-slate-500">
            Institutional Resource Borrowing & Lending Platform
          </p>
        </div>

        {/* Quick Demo Login Bar */}
        <div className="p-4 bg-blue-50/70 border-b border-blue-100 text-xs">
          <p className="font-bold text-primary mb-1.5 flex items-center justify-center gap-1">
            <span className="material-symbols-outlined text-[16px]">touch_app</span>
            Instant 1-Click Demo Login
          </p>
          <div className="grid grid-cols-2 gap-1.5 text-[11px]">
            <button
              onClick={() => handleQuick('steward')}
              className="py-1 px-2 rounded bg-white hover:bg-primary hover:text-white border border-blue-200 font-medium transition-colors"
            >
              👩‍🔬 Elena (Steward)
            </button>
            <button
              onClick={() => handleQuick('borrower')}
              className="py-1 px-2 rounded bg-white hover:bg-primary hover:text-white border border-blue-200 font-medium transition-colors"
            >
              👨‍🎓 Marcus (Borrower)
            </button>
            <button
              onClick={() => handleQuick('faculty')}
              className="py-1 px-2 rounded bg-white hover:bg-primary hover:text-white border border-blue-200 font-medium transition-colors"
            >
              🔬 Dr. Chen (Faculty)
            </button>
            <button
              onClick={() => handleQuick('admin')}
              className="py-1 px-2 rounded bg-white hover:bg-primary hover:text-white border border-blue-200 font-medium transition-colors"
            >
              🛡️ System Admin
            </button>
          </div>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-red-50 text-xs text-error font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex border-b border-slate-200 mb-2">
            <button
              type="button"
              onClick={() => setIsRegister(false)}
              className={`pb-2 text-xs font-bold w-1/2 transition-colors ${
                !isRegister ? 'text-primary border-b-2 border-primary' : 'text-slate-400'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsRegister(true)}
              className={`pb-2 text-xs font-bold w-1/2 transition-colors ${
                isRegister ? 'text-primary border-b-2 border-primary' : 'text-slate-400'
              }`}
            >
              Register Institutional Account
            </button>
          </div>

          {isRegister && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Alex Morgan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-secondary"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Institutional Email *
            </label>
            <input
              type="email"
              required
              placeholder="e.g. name@campus.edu or .edu address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-secondary"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Password *</label>
            <input
              type="password"
              required
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-secondary"
            />
          </div>

          {isRegister && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none"
                  >
                    <option value="student">Student</option>
                    <option value="faculty">Faculty Member</option>
                    <option value="club_coordinator">Club Coordinator</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Student/Staff ID</label>
                  <input
                    type="text"
                    placeholder="e.g. ID #8492"
                    value={campusId}
                    onChange={(e) => setCampusId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                <input
                  type="text"
                  placeholder="e.g. Computer Science, Mechanical Eng"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none"
                />
              </div>
            </>
          )}

          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-primary hover:bg-slate-900 text-white font-bold text-xs transition-colors shadow-sm disabled:opacity-50"
            >
              {loading ? 'Processing...' : isRegister ? 'Create Account' : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;
