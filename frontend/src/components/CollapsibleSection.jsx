import { useState } from 'react';

const Chevron = ({ open }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`h-5 w-5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
  >
    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CollapsibleSection = ({
  kicker,
  title,
  subtitle,
  actions,
  children,
  defaultOpen = true,
  className = '',
}) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className={`rounded-3xl border border-slate-100 bg-white shadow-soft ${className}`}>
      <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-left">
          {kicker && <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{kicker}</p>}
          {title && <h3 className="text-xl font-semibold text-slate-900">{title}</h3>}
          {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3">
          {actions}
          <button
            type="button"
            className="rounded-full border border-slate-200 p-2 text-slate-500 hover:text-slate-900 hover:border-slate-400"
            onClick={() => setOpen((prev) => !prev)}
            aria-expanded={open}
          >
            <Chevron open={open} />
          </button>
        </div>
      </div>
      {open && <div className="px-5 pb-6 sm:px-6">{children}</div>}
    </section>
  );
};

export default CollapsibleSection;
