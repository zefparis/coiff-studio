const StatsCard = ({ label, value, accent, helper }) => {
  return (
    <div className="rounded-3xl bg-slate-900 text-white p-6 shadow-soft">
      <p className="text-sm uppercase tracking-[0.3em] text-white/60">{label}</p>
      <p className="text-3xl font-semibold mt-4">{value}</p>
      {helper && <p className="text-white/70 text-sm mt-2">{helper}</p>}
      {accent && <div className="mt-6 text-xs font-semibold uppercase tracking-widest text-brand">{accent}</div>}
    </div>
  );
};

export default StatsCard;
