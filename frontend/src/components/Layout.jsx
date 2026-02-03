import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import Sidebar, { navLinks } from './Sidebar.jsx';

const Layout = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const closeDrawer = () => setMobileNavOpen(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-rose-50">
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Aura Studio</p>
            <p className="text-lg font-semibold text-slate-900">Salon management</p>
          </div>
          <nav className="hidden md:flex gap-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-2xl text-sm font-medium transition ${
                    isActive ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <button
            type="button"
            className="md:hidden rounded-full border border-slate-200 p-2 text-slate-600"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Ouvrir le menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <div className="hidden lg:block">
            <Sidebar />
          </div>
          <main className="bg-white rounded-3xl shadow-soft p-4 sm:p-8">
            <Outlet />
          </main>
        </div>
      </div>

      {mobileNavOpen && (
        <div className="fixed inset-0 z-30 flex">
          <div className="w-5/6 max-w-xs h-full bg-white shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Navigation</h2>
              <button
                type="button"
                className="rounded-full border border-slate-200 p-2 text-slate-500"
                onClick={closeDrawer}
                aria-label="Fermer le menu"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M6 18L18 6" />
                </svg>
              </button>
            </div>
            <Sidebar onNavigate={closeDrawer} />
          </div>
          <button
            type="button"
            className="flex-1 bg-slate-900/40"
            onClick={closeDrawer}
            aria-label="Fermer l'overlay"
          />
        </div>
      )}
    </div>
  );
};

export default Layout;
