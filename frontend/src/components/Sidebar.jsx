import { NavLink } from 'react-router-dom';

export const navLinks = [
  { to: '/', label: 'Tableau de bord' },
  { to: '/clients', label: 'Clients' },
  { to: '/appointments', label: 'Rendez-vous' },
  { to: '/invoices', label: 'Factures' },
  { to: '/products', label: 'Produits' },
  { to: '/purchases', label: 'Achats' },
  { to: '/accounting', label: 'Comptabilité' },
];

const Sidebar = ({ onNavigate }) => {
  return (
    <aside className="w-full sm:w-64 bg-white shadow-soft rounded-3xl p-6 flex flex-col gap-4">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-2">Salon</p>
        <h1 className="text-2xl font-semibold text-slate-900">M.Y COIFFURE</h1>
      </div>
      <nav className="flex flex-col gap-2 w-full">
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            onClick={() => onNavigate?.()}
            className={({ isActive }) =>
              `px-4 py-3 rounded-2xl font-medium transition shadow-sm border text-sm text-left ${
                isActive
                  ? 'bg-brand text-white border-brand shadow-lg'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-brand/60'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto pt-4 border-t border-slate-100">
        <p className="text-xs text-slate-400 uppercase tracking-[0.2em]">Contact</p>
        <p className="text-sm font-medium text-slate-700">m.ycoiffure77@gmail.com</p>
        <p className="text-sm font-medium text-slate-700">07 89 21 38 10</p>
      </div>
    </aside>
  );
};

export default Sidebar;
