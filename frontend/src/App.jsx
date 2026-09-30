import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import CatalogDashboard from './components/CatalogDashboard';
import MyLoansView from './components/MyLoansView';
import AdminPortalView from './components/AdminPortalView';
import ResourceDetailsModal from './components/ResourceDetailsModal';
import AddResourceModal from './components/AddResourceModal';
import AuthModal from './components/AuthModal';

const AppContent = () => {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog', 'loans', 'admin'
  const [selectedResource, setSelectedResource] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      {/* Fixed Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenAddResource={() => {
          if (!isAuthenticated) setIsAuthOpen(true);
          else setIsAddOpen(true);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 pt-16">
        {activeTab === 'catalog' && (
          <CatalogDashboard
            onSelectResource={(res) => setSelectedResource(res)}
            onOpenAddResource={() => {
              if (!isAuthenticated) setIsAuthOpen(true);
              else setIsAddOpen(true);
            }}
          />
        )}

        {activeTab === 'loans' && (
          <MyLoansView
            onSelectResource={(res) => setSelectedResource(res)}
            onOpenAddResource={() => setIsAddOpen(true)}
          />
        )}

        {activeTab === 'admin' && <AdminPortalView />}
      </main>

      {/* Institutional Civic Footer */}
      <footer className="bg-white border-t border-slate-200 py-10 mt-16 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <span className="font-headline font-bold text-slate-800 text-sm">CampusShare</span>
            <span className="hidden sm:inline text-slate-300">•</span>
            <span>Non-Monetary Institutional Peer Exchange</span>
          </div>

          <div className="flex items-center gap-6">
            <span>Academic Honor Code Compliant</span>
            <span>Verified Members Only</span>
            <span className="text-secondary font-semibold">100% Student & Faculty Sustained</span>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      <ResourceDetailsModal
        resource={selectedResource}
        isOpen={!!selectedResource}
        onClose={() => setSelectedResource(null)}
        onRequestSuccess={() => {
          setActiveTab('loans');
        }}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      <AddResourceModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onResourceAdded={() => {
          setActiveTab('loans');
        }}
      />

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
