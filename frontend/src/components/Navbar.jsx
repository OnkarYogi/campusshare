import React, { useState, useEffect, useRef } from 'react';
import CampusShareLogo from './CampusShareLogo';
import { useAuth } from '../context/AuthContext';
import { notificationService } from '../services/api';

const Navbar = ({ activeTab, setActiveTab, onOpenAuth, onOpenAddResource }) => {
  const { user, isAuthenticated, logout, quickLogin } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    try {
      const res = await notificationService.getNotifications();
      if (res.success) {
        setNotifications(res.notifications);
        setUnreadCount(res.unreadCount);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_1px_8px_rgba(0,0,0,0.03)]">
      <div className="h-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Brand & Campus Hub */}
        <div className="flex items-center gap-4">
          <div onClick={() => setActiveTab('catalog')}>
            <CampusShareLogo />
          </div>

          <div className="hidden xl:flex items-center gap-1.5 bg-surface-container-low px-3 py-1 rounded-full text-on-surface-variant text-xs font-medium">
            <span className="material-symbols-outlined text-secondary text-[16px]">school</span>
            <span>MIT World Peace University • Pune Campus</span>
            <span className="inline-block w-2 h-2 rounded-full bg-secondary ml-1" title="Campus Hub Active" />
          </div>
        </div>

        {/* Center Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-4 py-2 font-body font-semibold text-sm rounded-lg transition-colors ${
              activeTab === 'catalog'
                ? 'bg-primary text-white shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-slate-100'
            }`}
          >
            Explore Catalog
          </button>

          <button
            onClick={() => {
              if (!isAuthenticated) onOpenAuth();
              else setActiveTab('loans');
            }}
            className={`px-4 py-2 font-body font-semibold text-sm rounded-lg transition-colors ${
              activeTab === 'loans'
                ? 'bg-primary text-white shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-slate-100'
            }`}
          >
            My Borrowings & Lending
          </button>

          <button
            onClick={() => {
              if (!isAuthenticated) onOpenAuth();
              else onOpenAddResource();
            }}
            className="px-4 py-2 font-body font-semibold text-sm text-on-surface-variant hover:text-on-surface hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px] text-secondary">add_circle</span>
            Add Resource
          </button>

          {user?.role === 'admin' && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-4 py-2 font-body font-semibold text-sm rounded-lg transition-colors ${
                activeTab === 'admin'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-slate-100'
              }`}
            >
              Admin Portal
            </button>
          )}
        </nav>

        {/* Right Section Actions & Profile */}
        <div className="flex items-center gap-3">
          {/* Institutional Verified Badge */}
          {isAuthenticated && user?.isVerified && (
            <div className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              <span className="material-symbols-outlined text-[16px] text-emerald-600">verified</span>
              <span className="text-xs font-semibold">Institutional Verified</span>
            </div>
          )}

          {/* Notifications Dropdown */}
          {isAuthenticated && (
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications) loadNotifications();
                }}
                className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors relative"
                aria-label="Notifications"
              >
                <span className="material-symbols-outlined text-[22px]">notifications</span>
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-error text-white rounded-full flex items-center justify-center text-[10px] font-bold leading-none">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
                    <span className="font-headline font-bold text-sm text-slate-800">
                      Notifications
                    </span>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-xs text-secondary hover:underline font-medium"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-sm text-slate-400">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n._id}
                          className={`p-3 text-xs flex gap-3 hover:bg-slate-50 transition-colors ${
                            !n.read ? 'bg-blue-50/50' : ''
                          }`}
                        >
                          <span className="material-symbols-outlined text-secondary text-[20px] flex-shrink-0 mt-0.5">
                            {n.type === 'request_received'
                              ? 'inbox'
                              : n.type === 'request_approved'
                              ? 'check_circle'
                              : n.type === 'returned'
                              ? 'assignment_return'
                              : 'notifications'}
                          </span>
                          <div className="flex-1">
                            <p className="font-semibold text-slate-800">{n.title}</p>
                            <p className="text-slate-600 mt-0.5">{n.message}</p>
                            <span className="text-[10px] text-slate-400 mt-1 block">
                              {new Date(n.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Profile / Quick Role Switcher */}
          {isAuthenticated ? (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 pl-1 py-1 pr-2 rounded-full hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
              >
                <img
                  src={
                    user.avatarUrl ||
                    '/avatar-placeholder.svg'
                  }
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/20"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/avatar-placeholder.svg';
                  }}
                />
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-900 leading-tight">
                    {user.name}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium capitalize leading-tight">
                    {user.role.replace('_', ' ')} • ⭐ {user.trustScore}
                  </span>
                </div>
                <span className="material-symbols-outlined text-[16px] text-slate-400">
                  expand_more
                </span>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900">{user.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    <p className="text-[10px] font-semibold text-secondary mt-1">
                      Campus Trust Score: {user.trustScore} / 5.0
                    </p>
                  </div>

                  {/* Demo Role Switcher */}
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Switch Demo Role
                    </p>
                    <div className="grid grid-cols-2 gap-1 text-[11px]">
                      <button
                        onClick={() => {
                          quickLogin('steward');
                          setShowProfileMenu(false);
                        }}
                        className="text-left px-2 py-1 rounded hover:bg-slate-100 text-slate-700 font-medium"
                      >
                        Ananya (Steward)
                      </button>
                      <button
                        onClick={() => {
                          quickLogin('borrower');
                          setShowProfileMenu(false);
                        }}
                        className="text-left px-2 py-1 rounded hover:bg-slate-100 text-slate-700 font-medium"
                      >
                        Rohan (Borrower)
                      </button>
                      <button
                        onClick={() => {
                          quickLogin('faculty');
                          setShowProfileMenu(false);
                        }}
                        className="text-left px-2 py-1 rounded hover:bg-slate-100 text-slate-700 font-medium"
                      >
                        Dr. Joshi (Faculty)
                      </button>
                      <button
                        onClick={() => {
                          quickLogin('admin');
                          setShowProfileMenu(false);
                        }}
                        className="text-left px-2 py-1 rounded hover:bg-slate-100 text-slate-700 font-medium"
                      >
                        Admin Portal
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      logout();
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-error hover:bg-red-50 flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[16px]">logout</span>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => quickLogin('steward')}
                className="hidden sm:inline-flex px-3 py-1.5 text-xs font-semibold text-primary bg-primary-fixed hover:bg-blue-200 rounded-lg transition-colors"
              >
                Demo Login
              </button>
              <button
                onClick={onOpenAuth}
                className="px-4 py-2 text-xs font-bold text-white bg-primary hover:bg-slate-900 rounded-lg shadow-sm transition-colors"
              >
                Sign In / Join
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
